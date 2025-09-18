"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Clock, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { getCreatorEarningsReport, getCreatorPayouts } from "@/actions/payout";

interface EarningsDashboardProps {
  creator: any;
  totalEarnings: number;
  unpaidEarnings: number;
}

export default function EarningsDashboard({
  creator,
  totalEarnings,
  unpaidEarnings,
}: EarningsDashboardProps) {
  const [earningsData, setEarningsData] = useState<any>(null);
  const [payoutsData, setPayoutsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [earningsResult, payoutsResult] = await Promise.all([
          getCreatorEarningsReport(),
          getCreatorPayouts(),
        ]);

        if (earningsResult.success) {
          setEarningsData(earningsResult);
        }
        if (payoutsResult.success && payoutsResult.payouts) {
          setPayoutsData(payoutsResult.payouts);
        }
      } catch (error) {
        console.error("Error fetching earnings data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings Dashboard</CardTitle>
          <CardDescription>Loading your earnings data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Earnings Overview
          </CardTitle>
          <CardDescription>
            Your earnings and payout status as a managed creator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalEarnings || 0)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Pending Balance
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(unpaidEarnings || 0)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Products
              </p>
              <p className="text-2xl font-bold">
                {creator?.products?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      {earningsData?.earnings && earningsData.earnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Earnings
            </CardTitle>
            <CardDescription>Your latest earnings from sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earningsData.earnings.slice(0, 5).map((earning: any) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {earning.product?.name || "Unknown Product"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(earning.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(Number(earning.netAmount))}
                    </p>
                    <Badge
                      variant={earning.isPaid ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {earning.isPaid ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payouts */}
      {payoutsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Payouts
            </CardTitle>
            <CardDescription>Your payout history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payoutsData.slice(0, 5).map((payout: any) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Payout</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payout.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(Number(payout.amount))}
                    </p>
                    <Badge
                      variant={
                        payout.status === "completed"
                          ? "default"
                          : payout.status === "processing"
                          ? "secondary"
                          : payout.status === "failed"
                          ? "destructive"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!earningsData?.earnings || earningsData.earnings.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>No Earnings Yet</CardTitle>
            <CardDescription>
              Start creating products and hosting webinars to earn money!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Your earnings will appear here once you make your first sale.
            </p>
            <Button variant="outline">Create Your First Product</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
