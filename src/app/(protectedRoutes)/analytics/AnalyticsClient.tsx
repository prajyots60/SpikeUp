"use client";

import type { CreatorAnalytics } from "@/actions/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  MousePointer2,
  Users2,
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  Phone,
  Eye,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { ScrollArea } from "@/components/ui/scroll-area";

// Professional color palette
const COLORS = {
  primary: "#3B82F6",
  secondary: "#10B981",
  accent: "#8B5CF6",
  warning: "#F59E0B",
  danger: "#EF4444",
  success: "#059669",
  muted: "#6B7280",
  gradients: {
    blue: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    green: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    purple: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    orange: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    pink: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
};

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#F97316",
];

type Props = {
  data: CreatorAnalytics;
  // Optional filters if the page starts passing them down later
  onChangeDays?: (d: number) => void;
  onChangeWebinar?: (id: string | "all") => void;
  webinars?: { id: string; title: string }[];
  days?: number;
  webinarId?: string | "all";
};

export default function AnalyticsClient({
  data,
  onChangeDays,
  onChangeWebinar,
  webinars = [],
  days = 30,
  webinarId = "all",
}: Props) {
  const { totals, rates, trend30d, topFunnels, tags, calls, revenue } = data;
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

  // Enhanced Stat Component with animations and sparklines
  const EnhancedStat = ({
    title,
    value,
    icon: Icon,
    hint,
    trend,
    color = COLORS.primary,
    sparkData = [],
  }: {
    title: string;
    value: number | string;
    icon: React.ComponentType<any>;
    hint?: string;
    trend?: "up" | "down" | "neutral";
    color?: string;
    sparkData?: number[];
  }) => {
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
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-background via-background/95 to-muted/30">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 rounded-3xl blur-3xl" />
            <Card className="relative border-0 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                        <BarChart3 className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          Analytics Dashboard
                        </h1>
                        <p className="text-lg text-muted-foreground">
                          High-fidelity insights across your webinars, leads,
                          and revenue
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Filters */}
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Select
                        value={String(days)}
                        onValueChange={(v) => handleChangeDays(Number(v))}
                      >
                        <SelectTrigger className="w-[180px] border-0 bg-background/50 backdrop-blur-sm shadow-lg">
                          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                          <SelectValue placeholder="Range" />
                        </SelectTrigger>
                        <SelectContent className="border-0 bg-background/80 backdrop-blur-xl">
                          {[7, 14, 30, 60, 90].map((d) => (
                            <SelectItem
                              key={d}
                              value={String(d)}
                              className="hover:bg-primary/10"
                            >
                              {d} days
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {webinars.length > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Select
                          value={webinarId || "all"}
                          onValueChange={(v) => handleChangeWebinar(v as any)}
                        >
                          <SelectTrigger className="w-[250px] border-0 bg-background/50 backdrop-blur-sm shadow-lg">
                            <Target className="h-4 w-4 mr-2 text-accent" />
                            <SelectValue placeholder="All webinars" />
                          </SelectTrigger>
                          <SelectContent className="border-0 bg-background/80 backdrop-blur-xl">
                            <SelectItem
                              value="all"
                              className="hover:bg-primary/10"
                            >
                              All webinars
                            </SelectItem>
                            {webinars.map((w) => (
                              <SelectItem
                                key={w.id}
                                value={w.id}
                                className="hover:bg-primary/10"
                              >
                                {w.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Enhanced KPI Cards Grid */}
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

        {/* Conversion Funnel Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <Card className="h-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Users2 className="h-5 w-5" />
                  Registration → Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">
                  <CountUp
                    end={rates.regToAttend * 100}
                    duration={2}
                    decimals={1}
                    suffix="%"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Show-up rate
                </p>
              </CardContent>
            </Card>

            <Card className="h-full border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Target className="h-5 w-5" />
                  Attendance → Conversion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">
                  <CountUp
                    end={rates.attendToConvert * 100}
                    duration={2}
                    decimals={1}
                    suffix="%"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">Close rate</p>
              </CardContent>
            </Card>

            <Card className="h-full border-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-600">
                  <Zap className="h-5 w-5" />
                  Overall Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-indigo-600">
                  <CountUp
                    end={rates.overallConversion * 100}
                    duration={2}
                    decimals={1}
                    suffix="%"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  End-to-end conversion
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Enhanced Trend Chart */}
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
                    <linearGradient
                      id="regGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
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
                    <linearGradient
                      id="convGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
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
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Top Funnels with Enhanced Design */}
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
                    <CardTitle className="text-xl">
                      Top Performing Funnels
                    </CardTitle>
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

          {/* Top Tags Performance */}
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
                        <linearGradient
                          id="tagGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
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
                        type="number"
                        tickFormatter={(v) =>
                          `${(Number(v) * 100).toFixed(0)}%`
                        }
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
        </div>

        {/* Bottom Row: Call Pipeline & Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Call Pipeline */}
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
                          <span className="text-lg font-bold">
                            {call.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue */}
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
                        <p className="text-sm text-muted-foreground">
                          Total Revenue
                        </p>
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
                        const webinar = webinars.find(
                          (w) => w.id === item.webinarId
                        );
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
                              title:
                                selectedWebinar?.title || "Selected Webinar",
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
        </div>
      </div>
    </div>
  );
}
