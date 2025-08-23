"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useWebinarStore } from "@/store/useWebinarStore";
import { Info } from "lucide-react";
import React from "react";

const AdditionalInfoStep = () => {
  const { formData, updateAdditionalInfoField, getStepValidationErrors } =
    useWebinarStore();

  const errors = getStepValidationErrors("additionalInfo");

  const { lockChat, couponCode, couponEnabled } = formData.additionalInfo;

  const handleToggleLockChat = (checked: boolean) => {
    updateAdditionalInfoField("lockChat", checked);
  };

  const handleToggleCoupon = (checked: boolean) => {
    updateAdditionalInfoField("couponEnabled", checked);
  };

  const handleCouponCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateAdditionalInfoField("couponCode", value);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="lock-chat" className="text-base font-medium">
            Lock Chat
          </Label>
          <p className="text-sm text-gray-400">
            Turn it on to make chat visible to your users at all time.
          </p>
        </div>
        <Switch
          id="lock-chat"
          checked={lockChat || false}
          onCheckedChange={handleToggleLockChat}
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="couponCode" className="text-base font-medium">
              Coupon Code
            </Label>

            <p className="text-sm text-gray-400">
              Turn it on to offer discount.
            </p>
          </div>

          <Switch
            id="couponEnabled"
            checked={couponEnabled || false}
            onCheckedChange={handleToggleCoupon}
          />
        </div>
        {couponEnabled && (
          <div className="space-y-2">
            <Input
              id="coupon-code"
              name="couponCode"
              value={couponCode || ""}
              placeholder="Enter coupon code"
              onChange={handleCouponCodeChange}
              className={cn(
                "!bg-background/50 border border-input",
                errors.couponCode && "border-red-400 focus-visible:ring-red-400"
              )}
            />
            {errors.couponCode && (
              <p className="text-red-400 text-sm mt-1">{errors.couponCode}</p>
            )}
            <div className="flex items-start gpa-2 text-sm text-gray-400 mt-2">
              <Info className="w-4 h-4 mt-0.5" />
              <p>
                This coupon code will be used to promote a sale. Users can use
                it for Buy now CTA.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalInfoStep;
