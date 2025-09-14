import { getCreatorAnalytics } from "@/actions/analytics";
import { OnAuthenticateUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import AnalyticsClient from "./AnalyticsClient";
import { prismaClient } from "@/lib/prismaClient";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const auth = await OnAuthenticateUser();
  if (!auth.user) redirect("/sign-in");

  const params = await searchParams;
  const days = Number(params?.days ?? 30);

  // Provide webinars for filter select
  const webinars = await prismaClient.webinar.findMany({
    where: { presenterId: auth.user.id },
    select: { id: true, title: true },
    orderBy: { startTime: "desc" },
  });

  const rawWebinarId =
    typeof params?.webinarId === "string" ? params?.webinarId : undefined;
  const validWebinarId =
    rawWebinarId && webinars.some((w) => w.id === rawWebinarId)
      ? rawWebinarId
      : undefined;
  const res = await getCreatorAnalytics({
    days: isNaN(days) ? 30 : days,
    webinarId: validWebinarId,
  });
  if (!res.success) {
    return <div className="text-destructive">Failed to load analytics</div>;
  }
  return (
    <AnalyticsClient
      data={res.data}
      webinars={webinars}
      days={isNaN(days) ? 30 : days}
      webinarId={validWebinarId ?? "all"}
    />
  );
}
