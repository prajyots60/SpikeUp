import type { CreatorAnalytics } from "@/actions/analytics";

export type AnalyticsProps = {
  data: CreatorAnalytics;
  // Optional filters if the page starts passing them down later
  onChangeDays?: (d: number) => void;
  onChangeWebinar?: (id: string | "all") => void;
  webinars?: { id: string; title: string }[];
  days?: number;
  webinarId?: string | "all";
};

export type TrendType = "up" | "down" | "neutral";

export type EnhancedStatProps = {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  hint?: string;
  trend?: TrendType;
  color?: string;
  sparkData?: number[];
};
