"use server";

import { OnAuthenticateUser } from "./auth";
import { prismaClient } from "@/lib/prismaClient";
import { Attendance, AttendedTypeEnum, CtaTypeEnum } from "@prisma/client";
import { stripe } from "@/lib/stripe";

export type DailyPoint = {
  date: string;
  registrations: number;
  conversions: number;
};
export type WebinarFunnel = {
  webinarId: string;
  title: string;
  ctaType: CtaTypeEnum;
  stages: { stage: AttendedTypeEnum | "BREAKOUT_ROOM"; count: number }[];
  conversionRate: number; // converted / registered (0..1)
};
export type TagPerformance = {
  tag: string;
  registrations: number;
  conversions: number;
  conversionRate: number;
};
export type CallPipeline = { status: string; count: number }[];
export type RevenueByWebinar = {
  webinarId: string;
  title: string;
  amountCents: number;
}[];

export type CreatorAnalytics = {
  totals: {
    webinars: number;
    registrations: number;
    attended: number;
    converted: number;
  };
  rates: {
    regToAttend: number;
    attendToConvert: number;
    overallConversion: number; // converted / registrations
  };
  trend30d: DailyPoint[];
  topFunnels: WebinarFunnel[];
  tags: TagPerformance[];
  calls: CallPipeline;
  revenue: {
    totalCents: number;
    currency: string | null;
    sessions: number;
    aovCents: number; // average order value
    byWebinar: RevenueByWebinar;
  } | null;
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateYYYYMMDD(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getCreatorAnalytics(options?: {
  days?: number;
  webinarId?: string;
}): Promise<
  | { success: true; status: number; data: CreatorAnalytics }
  | { success: false; status: number; message: string }
> {
  const auth = await OnAuthenticateUser();
  if (!auth.user)
    return { success: false, status: 401, message: "Unauthenticated" };
  const presenterId = auth.user.id;

  // 1) Webinars owned by creator
  const webinars = await prismaClient.webinar.findMany({
    where: { presenterId },
    select: {
      id: true,
      title: true,
      ctaType: true,
      tags: true,
      startTime: true,
    },
    orderBy: { startTime: "desc" },
  });
  const webinarIds = webinars.map((w) => w.id);
  const filteredWebinarIds = options?.webinarId
    ? webinarIds.filter((id) => id === options.webinarId)
    : webinarIds;
  if (filteredWebinarIds.length === 0) {
    return {
      success: true,
      status: 200,
      data: {
        totals: { webinars: 0, registrations: 0, attended: 0, converted: 0 },
        rates: { regToAttend: 0, attendToConvert: 0, overallConversion: 0 },
        trend30d: [],
        topFunnels: [],
        tags: [],
        calls: [],
        revenue: null,
      },
    };
  }

  // 2) Funnel totals by webinar and type
  const grouped = await prismaClient.attendance.groupBy({
    by: ["webinarId", "attendedType"],
    where: { webinarId: { in: filteredWebinarIds } },
    _count: { _all: true },
  });

  let totalRegistrations = 0;
  let totalAttended = 0;
  let totalConverted = 0;

  const byWebinar = new Map<string, Map<AttendedTypeEnum, number>>();
  for (const row of grouped) {
    if (!byWebinar.has(row.webinarId)) byWebinar.set(row.webinarId, new Map());
    byWebinar
      .get(row.webinarId)!
      .set(row.attendedType as AttendedTypeEnum, row._count._all);

    if (row.attendedType === AttendedTypeEnum.REGISTERED)
      totalRegistrations += row._count._all;
    if (row.attendedType === AttendedTypeEnum.ATTENDED)
      totalAttended += row._count._all;
    if (row.attendedType === AttendedTypeEnum.CONVERTED)
      totalConverted += row._count._all;
  }

  // 3) Trend last 30d: registrations by createdAt; conversions by updatedAt when status=CONVERTED
  const dayWindow = Math.max(1, Math.min(365, options?.days ?? 30));
  const since = new Date();
  since.setDate(since.getDate() - dayWindow);
  const regs = await prismaClient.attendance.findMany({
    where: { webinarId: { in: filteredWebinarIds }, createdAt: { gte: since } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
    take: 5000,
  });
  const convs = await prismaClient.attendance.findMany({
    where: {
      webinarId: { in: filteredWebinarIds },
      attendedType: AttendedTypeEnum.CONVERTED,
      updatedAt: { gte: since },
    },
    select: { updatedAt: true },
    orderBy: { updatedAt: "asc" },
    take: 5000,
  });

  const trendMap = new Map<
    string,
    { registrations: number; conversions: number }
  >();
  for (let i = 0; i < dayWindow; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    trendMap.set(formatDateYYYYMMDD(d), { registrations: 0, conversions: 0 });
  }
  regs.forEach((r) => {
    const key = formatDateYYYYMMDD(startOfDay(r.createdAt));
    if (!trendMap.has(key))
      trendMap.set(key, { registrations: 0, conversions: 0 });
    trendMap.get(key)!.registrations += 1;
  });
  convs.forEach((c) => {
    const key = formatDateYYYYMMDD(startOfDay(c.updatedAt));
    if (!trendMap.has(key))
      trendMap.set(key, { registrations: 0, conversions: 0 });
    trendMap.get(key)!.conversions += 1;
  });
  const trend30d: DailyPoint[] = Array.from(trendMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, v]) => ({
      date,
      registrations: v.registrations,
      conversions: v.conversions,
    }));

  // 4) Build per-webinar funnels and pick top 6 by conversions
  const webinarMeta = new Map(webinars.map((w) => [w.id, w] as const));
  const funnels: WebinarFunnel[] = webinars.map((w) => {
    const counts = byWebinar.get(w.id) || new Map<AttendedTypeEnum, number>();
    const registered = counts.get(AttendedTypeEnum.REGISTERED) || 0;
    const attended = counts.get(AttendedTypeEnum.ATTENDED) || 0;
    const addedToCart = counts.get(AttendedTypeEnum.ADDED_TO_CART) || 0;
    const breakout = counts.get(AttendedTypeEnum.BREAKOUT_ROOM) || 0;
    const converted = counts.get(AttendedTypeEnum.CONVERTED) || 0;

    const stages = (
      w.ctaType === CtaTypeEnum.BOOK_A_CALL
        ? [
            { stage: AttendedTypeEnum.REGISTERED, count: registered },
            { stage: AttendedTypeEnum.ATTENDED, count: attended },
            { stage: "BREAKOUT_ROOM", count: breakout || addedToCart },
            { stage: AttendedTypeEnum.CONVERTED, count: converted },
          ]
        : [
            { stage: AttendedTypeEnum.REGISTERED, count: registered },
            { stage: AttendedTypeEnum.ATTENDED, count: attended },
            { stage: AttendedTypeEnum.ADDED_TO_CART, count: addedToCart },
            { stage: AttendedTypeEnum.CONVERTED, count: converted },
          ]
    ) as WebinarFunnel["stages"];

    const conversionRate = registered > 0 ? converted / registered : 0;
    return {
      webinarId: w.id,
      title: w.title,
      ctaType: w.ctaType,
      stages,
      conversionRate,
    };
  });
  const topFunnels = funnels
    .sort((a, b) => b.stages[3].count - a.stages[3].count)
    .slice(0, 6);

  // 5) Tag performance (registrations/conversions per tag)
  const tagAttendances = await prismaClient.attendance.findMany({
    where: { webinarId: { in: filteredWebinarIds }, createdAt: { gte: since } },
    include: { webinar: { select: { tags: true } } },
    take: 5000,
    orderBy: { createdAt: "desc" },
  });
  const tagMap = new Map<
    string,
    { registrations: number; conversions: number }
  >();
  for (const a of tagAttendances) {
    const tags = (a.webinar?.tags || []) as string[];
    for (const t of tags) {
      if (!tagMap.has(t)) tagMap.set(t, { registrations: 0, conversions: 0 });
      if (a.attendedType === AttendedTypeEnum.CONVERTED)
        tagMap.get(t)!.conversions += 1;
      if (a.attendedType === AttendedTypeEnum.REGISTERED)
        tagMap.get(t)!.registrations += 1;
    }
  }
  const tags: TagPerformance[] = Array.from(tagMap.entries())
    .map(([tag, v]) => ({
      tag,
      registrations: v.registrations,
      conversions: v.conversions,
      conversionRate: v.registrations ? v.conversions / v.registrations : 0,
    }))
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 10);

  // 6) Call pipeline statuses over attendees in creator's webinars
  const attendeeIdsDistinct = await prismaClient.attendance.findMany({
    where: { webinarId: { in: filteredWebinarIds } },
    select: { attendeeId: true },
    distinct: ["attendeeId"],
    take: 5000,
  });
  const attendeeIds = attendeeIdsDistinct.map((a) => a.attendeeId);
  let calls: CallPipeline = [];
  if (attendeeIds.length) {
    const callGroup = await prismaClient.attendee.groupBy({
      by: ["callStatus"],
      where: { id: { in: attendeeIds } },
      _count: { _all: true },
    });
    calls = callGroup.map((g) => ({
      status: g.callStatus,
      count: g._count._all,
    }));
  }

  // 7) Revenue from Stripe connected account (last 90d)
  let revenue: CreatorAnalytics["revenue"] = null;
  if (auth.user.stripeConnectId) {
    try {
      const stripeAccount = auth.user.stripeConnectId;
      const sinceSec = Math.floor(
        (Date.now() - dayWindow * 24 * 3600 * 1000) / 1000
      );
      const sessions = await stripe.checkout.sessions.list(
        { limit: 100, expand: ["data.line_items"], created: { gte: sinceSec } },
        { stripeAccount }
      );
      type Session = (typeof sessions.data)[number];
      const completed = sessions.data.filter(
        (s: Session) => s.status === "complete"
      );
      let totalCents = 0;
      const byWebinar = new Map<string, number>();
      let currency: string | null = null;
      for (const s of completed) {
        const amt = s.amount_total || 0;
        // filter by webinar if needed
        const wId = (s.metadata as any)?.webinarId || "unknown";
        if (options?.webinarId && wId !== options.webinarId) {
          continue;
        }
        totalCents += amt;
        if (!currency && s.currency) currency = s.currency;
        byWebinar.set(wId, (byWebinar.get(wId) || 0) + amt);
      }
      const byWebinarArr: RevenueByWebinar = Array.from(
        byWebinar.entries()
      ).map(([id, amountCents]) => {
        const meta = webinarMeta.get(id);
        return { webinarId: id, title: meta?.title || id, amountCents };
      });
      revenue = {
        totalCents: totalCents,
        currency,
        sessions: completed.length,
        aovCents: completed.length
          ? Math.round(totalCents / completed.length)
          : 0,
        byWebinar: byWebinarArr
          .sort((a, b) => b.amountCents - a.amountCents)
          .slice(0, 10),
      };
    } catch (e) {
      // keep revenue null if stripe fails
      revenue = null;
    }
  }

  const totals = {
    webinars: webinars.length,
    registrations: totalRegistrations,
    attended: totalAttended,
    converted: totalConverted,
  };
  const rates = {
    regToAttend: totals.registrations
      ? totals.attended / totals.registrations
      : 0,
    attendToConvert: totals.attended ? totals.converted / totals.attended : 0,
    overallConversion: totals.registrations
      ? totals.converted / totals.registrations
      : 0,
  };

  return {
    success: true,
    status: 200,
    data: {
      totals,
      rates,
      trend30d,
      topFunnels,
      tags,
      calls,
      revenue,
    },
  };
}
