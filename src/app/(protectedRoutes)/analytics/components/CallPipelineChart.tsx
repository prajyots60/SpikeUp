"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { CHART_COLORS } from "./constants";
import type { CreatorAnalytics } from "@/actions/analytics";

type CallPipelineChartProps = {
  data: CreatorAnalytics;
};

export function CallPipelineChart({ data }: CallPipelineChartProps) {
  const { calls } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="h-full border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <Phone className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Call Pipeline</CardTitle>
              <p className="text-sm text-muted-foreground">
                Lead status distribution
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No call data available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pie Chart */}
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={calls.map((c, idx) => ({
                        ...c,
                        fill: CHART_COLORS[idx % CHART_COLORS.length],
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {calls.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Status List */}
              <div className="space-y-3">
                {calls.map((call, index) => (
                  <div
                    key={call.status}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <span className="font-medium capitalize">
                        {call.status.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-lg font-bold">{call.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
