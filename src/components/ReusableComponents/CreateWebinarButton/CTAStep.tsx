"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useWebinarStore } from "@/store/useWebinarStore";
import { CtaTypeEnum } from "@prisma/client";
import { Search, X } from "lucide-react";
import React, { useState } from "react";
import Stripe from "stripe";

type Props = {
  assistants: any[];
  stripeProducts: Stripe.Product[] | [];
};

const CTAStep = ({ assistants, stripeProducts }: Props) => {
  const { formData, updateCTAField, getStepValidationErrors } =
    useWebinarStore();

  const errors = getStepValidationErrors("cta");

  const { ctaLabel, ctaType, tags, aiAgent, priceId } = formData.cta;

  const [tagInput, setTagInput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateCTAField(name as keyof typeof formData.cta, value);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      const newTag = tagInput.trim();
      updateCTAField("tags", [...(tags ?? []), newTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateCTAField(
      "tags",
      tags?.filter((t) => t !== tag)
    );
  };

  const handleSelectCtaType = (value: string) => {
    updateCTAField("ctaType", value as CtaTypeEnum);
  };

  const handleProductChange = (value: string) => {
    updateCTAField("priceId", value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="ctaLabel"
          className={errors.ctaLabel ? "text-red-400" : ""}
        >
          CTA Label <span className="text-red-400">*</span>
        </Label>
        <Input
          id="ctaLabel"
          name="ctaLabel"
          value={ctaLabel || ""}
          placeholder="Enter CTA label"
          onChange={handleChange}
          className={cn(
            "!bg-background/50 border border-input",
            errors.ctaLabel && "border-red-400 focus-visible:ring-red-400"
          )}
        />
        {errors.ctaLabel && (
          <p className="text-red-400 text-sm mt-1">{errors.ctaLabel}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          value={tagInput || ""}
          placeholder="Add tag and press Enter"
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="!bg-background/50 border border-input"
        />
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded-md "
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ctaType">CTA Type</Label>
        <Tabs defaultValue={CtaTypeEnum.BOOK_A_CALL} className="w-full">
          <TabsList className="w-full bg-transparent">
            <TabsTrigger
              value={CtaTypeEnum.BOOK_A_CALL}
              className="w-1/2 data-[state=active]:!bg-background/50"
              onClick={() => handleSelectCtaType(CtaTypeEnum.BOOK_A_CALL)}
            >
              Book a Call
            </TabsTrigger>
            <TabsTrigger
              value={CtaTypeEnum.BUY_NOW}
              className="w-1/2 "
              onClick={() => handleSelectCtaType(CtaTypeEnum.BUY_NOW)}
            >
              Buy Now
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-2">
        <Label>Attach a Product</Label>
        <div className="relative">
          <div className="mb-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search Agents..."
                className="pl-9 !bg-background/50 border border-input"
              />
            </div>
          </div>

          <Select value={priceId} onValueChange={handleProductChange}>
            <SelectTrigger className="w-full !bg-background/50 border border-input">
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>

            <SelectContent className="max-h-48 bg-background border border-input">
              {stripeProducts.length > 0 ? (
                stripeProducts.map((product) => (
                  <SelectItem
                    key={product.id}
                    value={product?.default_price?.toString() || ""} // Ensure value is a string
                    className="!bg-background/50 hover:!bg-white/10"
                  >
                    {product.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  Create product in Stripe.
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CTAStep;
