"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { DollarSign } from "lucide-react";
import { COLORS } from "./constants";
import type { CreatorAnalytics } from "@/actions/analytics";

type RevenueAnalyticsProps = {
  data: CreatorAnalytics;
  webinars?: { id: string; title: string }[];
  webinarId?: string | "all";
};

export function RevenueAnalytics({
  data,
  webinars = [],
  webinarId = "all",
}: RevenueAnalyticsProps) {
  const { revenue } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card className="h-full border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Revenue Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Stripe connected payments
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {revenue ? (
            <div className="space-y-6">
              {/* Revenue Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/5">
                  <div className="text-3xl font-bold text-emerald-600">
                    <CountUp
                      end={revenue.totalCents / 100}
                      duration={2.5}
                      separator=","
                      prefix={`${revenue.currency?.toUpperCase() || ""} `}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
                  <div className="text-3xl font-bold text-blue-600">
                    <CountUp
                      end={revenue.aovCents / 100}
                      duration={2.5}
                      separator=","
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Avg Order Value
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="text-xl font-semibold text-muted-foreground">
                  {revenue.sessions} successful transactions
                </div>
              </div>

              {/* Revenue by Webinar */}
              {(() => {
                // Prepare data based on selection
                let chartData = revenue.byWebinar || [];

                // Enhance data with proper webinar titles from the webinars prop
                chartData = chartData.map((item) => {
                  const webinar = webinars.find((w) => w.id === item.webinarId);
                  // Always use webinar.title if found, otherwise use fallbacks
                  let displayTitle = item.title;
                  if (webinar?.title) {
                    displayTitle = webinar.title;
                  } else if (item.webinarId === "unknown") {
                    displayTitle = "Unknown Webinar";
                  } else if (
                    item.title === item.webinarId ||
                    item.title.length > 30
                  ) {
                    // If title looks like an ID (same as webinarId or very long), use a fallback
                    displayTitle = "Webinar";
                  }

                  return {
                    ...item,
                    title: displayTitle,
                  };
                });

                // If specific webinar is selected, show only that one (or create zero entry)
                if (webinarId && webinarId !== "all") {
                  const selectedEntry = chartData.find(
                    (item) => item.webinarId === webinarId
                  );
                  if (selectedEntry) {
                    chartData = [selectedEntry];
                  } else {
                    // Create zero entry for selected webinar
                    const selectedWebinar = webinars.find(
                      (w) => w.id === webinarId
                    );
                    chartData = [
                      {
                        webinarId: webinarId,
                        title: selectedWebinar?.title || "Selected Webinar",
                        amountCents: 0,
                      },
                    ];
                  }
                }

                return (
                  chartData.length > 0 && (
                    <div className="overflow-x-auto">
                      <div
                        style={{
                          minWidth: Math.max(chartData.length * 120, 400),
                        }}
                      >
                        <ChartContainer
                          config={{
                            amountCents: {
                              label: "Revenue",
                              color: COLORS.success,
                            },
                          }}
                          className="h-[220px]"
                        >
                          <BarChart
                            data={chartData}
                            margin={{
                              left: 20,
                              right: 20,
                              top: 10,
                              bottom: 50,
                            }}
                          >
                            <defs>
                              <linearGradient
                                id="revenueGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
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
                              dataKey="title"
                              interval={0}
                              tick={{ fontSize: 11, textAnchor: "end" }}
                              tickFormatter={(value) =>
                                value.length > 15
                                  ? `${value.slice(0, 15)}...`
                                  : value
                              }
                              angle={-45}
                              height={80}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              tickFormatter={(v) =>
                                (Number(v) / 100).toLocaleString()
                              }
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Bar
                              dataKey="amountCents"
                              fill="url(#revenueGradient)"
                              radius={[6, 6, 0, 0]}
                              maxBarSize={60}
                            />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </div>
                  )
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Connect Stripe to see revenue analytics</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
