"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { ArrowUpRight, ArrowDownRight, Activity, Sparkles } from "lucide-react";
import { COLORS } from "./constants";
import type { EnhancedStatProps } from "./types";

export function EnhancedStat({
  title,
  value,
  icon: Icon,
  hint,
  trend,
  color = COLORS.primary,
  sparkData = [],
}: EnhancedStatProps) {
  const isNumber = typeof value === "number";
  const TrendIcon =
    trend === "up"
      ? ArrowUpRight
      : trend === "down"
      ? ArrowDownRight
      : Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-background/80 to-muted/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 pointer-events-none" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {trend && (
                <TrendIcon
                  className={`h-3 w-3 ${
                    trend === "up"
                      ? "text-green-500"
                      : trend === "down"
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
              )}
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-bold tracking-tight">
            {isNumber ? (
              <CountUp
                end={value as number}
                duration={2.5}
                separator=","
                decimals={typeof value === "number" && value < 1 ? 1 : 0}
                suffix={
                  typeof value === "string" && (value as string).includes("%")
                    ? "%"
                    : ""
                }
              />
            ) : (
              value
            )}
          </div>
          {hint && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {hint}
            </div>
          )}

          {/* Mini Sparkline */}
          {sparkData.length > 0 && (
            <div className="h-8 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={sparkData.map((val, idx) => ({
                    value: val,
                    index: idx,
                  }))}
                >
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.2}
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
