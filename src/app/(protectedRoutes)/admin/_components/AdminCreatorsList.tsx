"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Users, DollarSign, Package, Calendar, Send } from "lucide-react";
import { createCreatorPayout } from "@/actions/payout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Creator {
  id: string;
  name: string;
  email: string;
  totalEarnings: number;
  unpaidEarnings: number;
  totalPayouts: number;
  productCount: number;
  webinarCount: number;
  lastEarning: Date | null;
}

interface AdminCreatorsListProps {
  creators: Creator[];
}

export default function AdminCreatorsList({
  creators,
}: AdminCreatorsListProps) {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const handleCreatePayout = async () => {
    if (!selectedCreator || !payoutAmount) return;

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > selectedCreator.unpaidEarnings) {
      toast.error("Payout amount cannot exceed unpaid earnings");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createCreatorPayout(
          selectedCreator.id,
          amount,
          "manual",
          payoutNotes
        );

        if (result.success) {
          toast.success("Payout created successfully");
          setPayoutAmount("");
          setPayoutNotes("");
          setSelectedCreator(null);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to create payout");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
      }
    });
  };

  if (!creators || creators.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Managed Creators</CardTitle>
          <CardDescription>
            No managed creators found in the system yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Creators will appear here when they join as managed creators.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Managed Creators</CardTitle>
        <CardDescription>
          View and manage all creators using the platform account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {creators.map((creator) => (
            <div
              key={creator.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {creator.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{creator.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {creator.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Earnings
                    </p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(creator.totalEarnings)}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      Pending
                    </p>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(creator.unpaidEarnings)}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      Products
                    </p>
                    <p className="font-semibold">{creator.productCount}</p>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        disabled={creator.unpaidEarnings <= 0}
                        onClick={() => setSelectedCreator(creator)}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Pay Out
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Payout</DialogTitle>
                        <DialogDescription>
                          Create a payout for {creator.name}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="amount">Payout Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            max={creator.unpaidEarnings}
                            placeholder="0.00"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Maximum: {formatCurrency(creator.unpaidEarnings)}
                          </p>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="notes">Notes (optional)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Add any notes about this payout..."
                            value={payoutNotes}
                            onChange={(e) => setPayoutNotes(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={handleCreatePayout}
                            disabled={isPending || !payoutAmount}
                            className="flex-1"
                          >
                            {isPending ? "Creating..." : "Create Payout"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedCreator(null);
                              setPayoutAmount("");
                              setPayoutNotes("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{creator.webinarCount} webinars</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Last earning: {formatDate(creator.lastEarning)}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Paid: {formatCurrency(creator.totalPayouts)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
