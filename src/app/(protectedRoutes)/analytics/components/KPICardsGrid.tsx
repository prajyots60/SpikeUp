"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MousePointer2, Users2, Eye, Target, TrendingUp } from "lucide-react";
import { EnhancedStat } from "./EnhancedStat";
import { COLORS } from "./constants";
import type { CreatorAnalytics } from "@/actions/analytics";

type KPICardsGridProps = {
  data: CreatorAnalytics;
};

export function KPICardsGrid({ data }: KPICardsGridProps) {
  const { totals, rates, trend30d } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
        <EnhancedStat
          title="Total Webinars"
          value={totals.webinars}
          icon={MousePointer2}
          trend="neutral"
          color={COLORS.primary}
          hint="Active presentations"
        />
        <EnhancedStat
          title="Registrations"
          value={totals.registrations}
          icon={Users2}
          trend="up"
          color={COLORS.secondary}
          hint="Total sign-ups"
          sparkData={trend30d.slice(-7).map((d) => d.registrations)}
        />
        <EnhancedStat
          title="Attendees"
          value={totals.attended}
          icon={Eye}
          trend="up"
          color={COLORS.accent}
          hint="Actually joined"
          sparkData={trend30d.slice(-7).map((d) => d.conversions)}
        />
        <EnhancedStat
          title="Conversions"
          value={totals.converted}
          icon={Target}
          trend="up"
          color={COLORS.success}
          hint="Sales completed"
        />
        <EnhancedStat
          title="Conversion Rate"
          value={`${(rates.overallConversion * 100).toFixed(1)}%`}
          icon={TrendingUp}
          trend={rates.overallConversion > 0.05 ? "up" : "neutral"}
          color={COLORS.warning}
          hint="Overall performance"
        />
      </div>
    </motion.div>
  );
}
