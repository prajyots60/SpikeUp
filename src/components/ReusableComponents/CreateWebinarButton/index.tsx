"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWebinarStore } from "@/store/useWebinarStore";
import { PlusIcon } from "lucide-react";
import React, { useState } from "react";
import MultiStepForm from "./MultiStepForm";
import { Basic } from "next/font/google";
import BasicInfoStep from "./BasicInfoStep";
import CTAStep from "./CTAStep";
import AdditionalInfoStep from "./AdditionalInfoStep";
import Stripe from "stripe";

type Props = {
  stripeProducts: Stripe.Product[] | [];
};

const CreateWebinarButton = ({ stripeProducts }: Props) => {
  const { isModalOpen, setModalOpen, isComplete, setComplete } =
    useWebinarStore();

  const [webinarLink, setWebinarLink] = useState("");

  const steps = [
    {
      id: "basicInfo",
      title: "Basic Information",
      description: "Enter the basic information for your webinar",
      component: <BasicInfoStep />,
    },
    {
      id: "cta",
      title: "Call to Action",
      description: "Please provide end to end CTA for your webinar",
      component: <CTAStep assistants={[]} stripeProducts={stripeProducts} />,
    },
    {
      id: "additionalInfo",
      title: "Additional Information",
      description: "Provide any additional information for your webinar",
      component: <AdditionalInfoStep />,
    },
  ];

  const handleComplete = (webinarId: string) => {
    setComplete(true);
    setWebinarLink(
      `${process.env.NEXT_PUBLIC_BASE_URL}/live-webinar/${webinarId}`
    );
  };
  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20"
          onClick={() => setModalOpen(true)}
        >
          <PlusIcon />
          Create Webinar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] p-0 bg-transparent border-none">
        {isComplete ? (
          <div className="bg-muted text-primary rounded-lg overflow-hidden">
            <DialogTitle className="sr-only">Webinar Created</DialogTitle>
          </div>
        ) : (
          <>
            <DialogTitle className="sr-only">Create Webinar</DialogTitle>

            <MultiStepForm steps={steps} onComplete={handleComplete} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateWebinarButton;
