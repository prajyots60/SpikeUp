"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Users2, Target, Zap } from "lucide-react";
import type { CreatorAnalytics } from "@/actions/analytics";

type ConversionFunnelCardsProps = {
  data: CreatorAnalytics;
};

export function ConversionFunnelCards({ data }: ConversionFunnelCardsProps) {
  const { rates } = data;

  return (
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
            <p className="text-sm text-muted-foreground mt-2">Show-up rate</p>
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
  );
}
