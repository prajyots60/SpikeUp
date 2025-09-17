"use client";

import PageHeader from "@/components/ReusableComponents/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, CalendarDays, TrendingUp, Target } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import * as React from "react";

type AnalyticsHeaderClientProps = {
  webinars?: { id: string; title: string }[];
  days?: number;
  webinarId?: string | "all";
  onChangeDays?: (d: number) => void;
  onChangeWebinar?: (id: string | "all") => void;
};

export default function AnalyticsHeaderClient({
  webinars = [],
  days = 30,
  webinarId = "all",
  onChangeDays,
  onChangeWebinar,
}: AnalyticsHeaderClientProps) {
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
    <PageHeader
      heading="Analytics Dashboard"
      leftIcon={<TrendingUp className="w-3 h-3" />}
      mainIcon={<BarChart3 className="w-8 h-8" />}
      rightIcon={<Target className="w-3 h-3" />}
      placeholder="Search analytics data..."
    >
      {/* Filter Controls */}
      <div className="flex items-center gap-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Select
            value={String(days)}
            onValueChange={(v) => handleChangeDays(Number(v))}
          >
            <SelectTrigger className="w-[180px]">
              <CalendarDays className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              {[7, 14, 30, 60, 90].map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d} days
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {webinars.length > 0 && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Select
              value={webinarId || "all"}
              onValueChange={(v) => handleChangeWebinar(v as any)}
            >
              <SelectTrigger className="w-[250px]">
                <Target className="h-4 w-4 mr-2 text-accent" />
                <SelectValue placeholder="All webinars" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All webinars</SelectItem>
                {webinars.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </div>
    </PageHeader>
  );
}
