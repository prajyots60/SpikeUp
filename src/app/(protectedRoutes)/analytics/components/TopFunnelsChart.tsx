"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3 } from "lucide-react";
import { CHART_COLORS } from "./constants";
import type { CreatorAnalytics } from "@/actions/analytics";

type TopFunnelsChartProps = {
  data: CreatorAnalytics;
};

export function TopFunnelsChart({ data }: TopFunnelsChartProps) {
  const { topFunnels } = data;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="h-full border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-xl shadow-2xl lg:min-h-[520px] overflow-hidden">
        <CardHeader className="space-y-1 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
              <BarChart3 className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Top Performing Funnels</CardTitle>
              <p className="text-sm text-muted-foreground">
                Conversion breakdown by webinar
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {topFunnels.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No funnel data available yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[420px] pr-2">
              <div className="space-y-4">
                {topFunnels.map((f) => (
                  <div
                    key={f.webinarId}
                    className="relative border border-border/50 rounded-2xl p-5 bg-gradient-to-br from-background/80 to-muted/10 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base truncate pr-4">
                          {f.title}
                        </h4>
                        <p className="text-xs text-muted-foreground capitalize">
                          {f.ctaType.replace("_", " ").toLowerCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">
                          <CountUp
                            end={f.conversionRate * 100}
                            duration={1.5}
                            decimals={1}
                            suffix="%"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Conversion
                        </p>
                      </div>
                    </div>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={f.stages.map((s, idx) => ({
                            name: String(s.stage).replace("_", " "),
                            value: s.count,
                            fill: CHART_COLORS[idx % CHART_COLORS.length],
                          }))}
                          margin={{
                            top: 0,
                            right: 0,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--muted))"
                            strokeOpacity={0.3}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
