"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { COLORS } from "./constants";
import type { CreatorAnalytics } from "@/actions/analytics";

type PerformanceTrendChartProps = {
  data: CreatorAnalytics;
};

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  const { trend30d } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Performance Trend</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Registrations vs Conversions over time
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer
            config={{
              registrations: {
                label: "Registrations",
                color: COLORS.primary,
              },
              conversions: {
                label: "Conversions",
                color: COLORS.secondary,
              },
            }}
            className="h-[400px]"
          >
            <AreaChart
              data={trend30d}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={COLORS.primary}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="100%"
                    stopColor={COLORS.primary}
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="convGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={COLORS.secondary}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="100%"
                    stopColor={COLORS.secondary}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted))"
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="registrations"
                stroke={COLORS.primary}
                fill="url(#regGradient)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey="conversions"
                stroke={COLORS.secondary}
                fill="url(#convGradient)"
                strokeWidth={3}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
