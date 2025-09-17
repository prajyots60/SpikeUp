"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  KPICardsGrid,
  ConversionFunnelCards,
  PerformanceTrendChart,
  TopFunnelsChart,
  TagPerformanceChart,
  CallPipelineChart,
  RevenueAnalytics,
  type AnalyticsProps,
} from "./components";
import AnalyticsHeaderClient from "./AnalyticsHeaderClient";

export default function AnalyticsClient({
  data,
  onChangeDays,
  onChangeWebinar,
  webinars = [],
  days = 30,
  webinarId = "all",
}: AnalyticsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChangeDays = React.useCallback(
    (d: number) => {
      if (onChangeDays) return onChangeDays(d);
      const params = new URLSearchParams(searchParams?.toString());
      params.set("days", String(d));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [onChangeDays, pathname, router, searchParams]
  );

  const handleChangeWebinar = React.useCallback(
    (id: string | "all") => {
      if (onChangeWebinar) return onChangeWebinar(id);
      const params = new URLSearchParams(searchParams?.toString());
      if (!id || id === "all") params.delete("webinarId");
      else params.set("webinarId", id);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [onChangeWebinar, pathname, router, searchParams]
  );

  return (
    <div className="w-full flex flex-col gap-8">
      <AnalyticsHeaderClient
        webinars={webinars}
        days={days}
        webinarId={webinarId}
        onChangeDays={handleChangeDays}
        onChangeWebinar={handleChangeWebinar}
      />

      <div className="space-y-8">
        <KPICardsGrid data={data} />

        <ConversionFunnelCards data={data} />

        <PerformanceTrendChart data={data} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <TopFunnelsChart data={data} />

          <TagPerformanceChart data={data} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <CallPipelineChart data={data} />

          <RevenueAnalytics
            data={data}
            webinars={webinars}
            webinarId={webinarId}
          />
        </div>
      </div>
    </div>
  );
}
