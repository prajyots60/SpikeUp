"use server";

import { prismaClient } from "@/lib/prismaClient";
import { AttendedTypeEnum } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

export type LeadItem = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tags: string[];
  status: AttendedTypeEnum;
  lastSeenAt: Date;
  occurrences: number;
};

function statusToTag(status: AttendedTypeEnum): string {
  switch (status) {
    case AttendedTypeEnum.REGISTERED:
      return "Registered";
    case AttendedTypeEnum.ATTENDED:
      return "Attended";
    case AttendedTypeEnum.ADDED_TO_CART:
      return "Added to Cart";
    case AttendedTypeEnum.FOLLOW_UP:
      return "Follow-up";
    case AttendedTypeEnum.BREAKOUT_ROOM:
      return "Breakout Room";
    case AttendedTypeEnum.CONVERTED:
      return "Converted";
    default:
      return "Lead";
  }
}

export async function getLeadsForCurrentUser(options?: {
  excludeConverted?: boolean; // legacy flag; ignored if includeConverted is true
  includeConverted?: boolean;
  category?: "ALL" | "COLD" | "WARM" | "HOT";
  query?: string; // search by name/email
  page?: number;
  pageSize?: number;
}): Promise<
  | {
      success: true;
      status: number;
      data: LeadItem[];
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    }
  | { success: false; status: number; message: string }
> {
  const category = options?.category ?? "ALL";
  const includeConverted = options?.includeConverted ?? false;
  const effectiveExcludeConverted = includeConverted
    ? false
    : options?.excludeConverted ?? true;
  const pageSize = Math.max(1, Math.min(100, options?.pageSize ?? 20));
  const page = Math.max(1, options?.page ?? 1);
  const query = (options?.query || "").trim().toLowerCase();
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, status: 401, message: "Unauthenticated" };
    }

    const dbUser = await prismaClient.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });
    if (!dbUser) {
      return { success: false, status: 403, message: "User not found" };
    }

    const webinars = await prismaClient.webinar.findMany({
      where: { presenterId: dbUser.id },
      select: { id: true },
    });

    if (webinars.length === 0) {
      const pageSize = Math.max(1, Math.min(100, options?.pageSize ?? 20));
      const page = Math.max(1, options?.page ?? 1);
      return {
        success: true,
        status: 200,
        data: [],
        page,
        pageSize,
        total: 0,
        totalPages: 1,
      };
    }

    const webinarIds = webinars.map((w) => w.id);

    const attendances = await prismaClient.attendance.findMany({
      where: { webinarId: { in: webinarIds } },
      include: {
        user: true,
        webinar: { select: { tags: true } },
      },
      orderBy: { joinedAt: "desc" },
      take: 2000,
    });

    const map = new Map<string, LeadItem & { _latestAt: number }>();

    for (const a of attendances) {
      if (
        effectiveExcludeConverted &&
        a.attendedType === AttendedTypeEnum.CONVERTED
      ) {
        continue;
      }

      const u = a.user as any; // phone field may not be in generated types until prisma generate runs
      const existing = map.get(a.attendeeId);

      const tagsFromWebinar = Array.isArray(a.webinar?.tags)
        ? (a.webinar!.tags as string[])
        : [];
      const statusTag = statusToTag(a.attendedType);

      if (!existing) {
        map.set(a.attendeeId, {
          id: a.attendeeId,
          name: a.user.name,
          email: a.user.email,
          phone: u?.phone || "",
          tags: Array.from(new Set([...tagsFromWebinar, statusTag])),
          status: a.attendedType,
          lastSeenAt: a.joinedAt,
          occurrences: 1,
          _latestAt: a.joinedAt.getTime(),
        });
      } else {
        const latest = Math.max(existing._latestAt, a.joinedAt.getTime());
        const lastWasThis = latest === a.joinedAt.getTime();
        const mergedTags = new Set<string>([
          ...existing.tags,
          ...tagsFromWebinar,
          statusTag,
        ]);
        map.set(a.attendeeId, {
          ...existing,
          tags: Array.from(mergedTags),
          status: lastWasThis ? a.attendedType : existing.status,
          lastSeenAt: new Date(latest),
          occurrences: existing.occurrences + 1,
          _latestAt: latest,
        });
      }
    }

    let data = Array.from(map.values()).map((v) => {
      const tags = new Set(v.tags);
      if (v.occurrences > 1) tags.add("Returning");
      return { ...v, tags: Array.from(tags) } as LeadItem;
    });

    // Optional text search (name or email)
    if (query) {
      data = data.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.email.toLowerCase().includes(query)
      );
    }

    // Optional category filter by latest status
    if (category && category !== "ALL") {
      const inSet = (s: AttendedTypeEnum) => {
        if (category === "COLD") return s === AttendedTypeEnum.REGISTERED;
        if (category === "WARM")
          return (
            s === AttendedTypeEnum.ATTENDED || s === AttendedTypeEnum.FOLLOW_UP
          );
        if (category === "HOT")
          return (
            s === AttendedTypeEnum.BREAKOUT_ROOM ||
            s === AttendedTypeEnum.ADDED_TO_CART
          );
        return true;
      };
      data = data.filter((d) => inSet(d.status));
    }

    // Sort by most recent interaction
    data.sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());

    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const paged = data.slice(start, start + pageSize);

    return {
      success: true,
      status: 200,
      data: paged,
      page,
      pageSize,
      total,
      totalPages,
    };
  } catch (e) {
    console.error("getLeadsForCurrentUser failed", e);
    return { success: false, status: 500, message: "Internal server error" };
  }
}
