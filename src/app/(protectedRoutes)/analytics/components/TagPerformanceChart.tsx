"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { COLORS } from "./constants";
import type { CreatorAnalytics } from "@/actions/analytics";

type TagPerformanceChartProps = {
  data: CreatorAnalytics;
};

export function TagPerformanceChart({ data }: TagPerformanceChartProps) {
  const { tags } = data;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="h-full border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-xl shadow-2xl lg:min-h-[520px]">
        <CardHeader className="space-y-1 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
              <Target className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Tag Performance</CardTitle>
              <p className="text-sm text-muted-foreground">
                Conversion rates by tag
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="[&_svg]:max-w-full">
          {tags.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tag data available</p>
            </div>
          ) : (
            <ChartContainer
              config={{
                conversionRate: {
                  label: "Conversion Rate",
                  color: COLORS.success,
                },
              }}
              className="h-[440px] w-full max-w-full overflow-hidden [&_.recharts-wrapper]:!max-w-full [&_.recharts-surface]:!max-w-full"
            >
              <BarChart
                data={tags}
                layout="vertical"
                margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="tagGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop
                      offset="0%"
                      stopColor={COLORS.success}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="100%"
                      stopColor={COLORS.success}
                      stopOpacity={0.4}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                  strokeOpacity={0.3}
                />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `${(Number(v) * 100).toFixed(0)}%`}
                  domain={[0, 1]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="tag"
                  width={140}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) =>
                    v?.length > 18 ? `${v.slice(0, 18)}…` : v
                  }
                />
                <Bar
                  dataKey="conversionRate"
                  fill="url(#tagGradient)"
                  radius={[0, 8, 8, 0]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
