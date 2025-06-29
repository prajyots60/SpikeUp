"use server";

import { WebinarFormState } from "@/store/useWebinarStore";
import { OnAuthenticateUser } from "./auth";
import { prismaClient } from "@/lib/prismaClient";
import { revalidatePath } from "next/cache";

function combineDateTime(
  date: Date,
  timeStr: string,
  timeFormat: "AM" | "PM"
): Date {
  const [hoursStr, minutesStr] = timeStr.split(":");
  let hours = Number.parseInt(hoursStr, 10);
  const minutes = Number.parseInt(minutesStr || "0", 10);

  if (timeFormat === "PM" && hours < 12) {
    hours += 12; // Convert to 24-hour format
  } else if (timeFormat === "AM" && hours === 12) {
    hours = 0; // Midnight case
  }

  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0); // Set hours and minutes
  return result;
}

export const createWebinar = async (formData: WebinarFormState) => {
  try {
    const user = await OnAuthenticateUser();

    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const presenterId = user.user?.id;

    console.log("Creating webinar with data:", formData, presenterId);

    if (!formData.basicInfo.webinarName) {
      return { status: 400, message: "Webinar name is required" };
    }

    if (!formData.basicInfo.date) {
      return { status: 400, message: "Date is required" };
    }
    if (!formData.basicInfo.time) {
      return { status: 400, message: "Time is required" };
    }

    const combinedDateTime = combineDateTime(
      new Date(formData.basicInfo.date),
      formData.basicInfo.time,
      formData.basicInfo.timeFormat || "AM"
    );

    const now = new Date();
    if (combinedDateTime < now) {
      return {
        status: 400,
        message: "Webinar date and time can not be in the past",
      };
    }

    const webinar = await prismaClient.webinar.create({
      data: {
        title: formData.basicInfo.webinarName,
        description: formData.basicInfo.description || "",
        startTime: combinedDateTime,
        tags: formData.cta.tags || [],
        ctaLabel: formData.cta.ctaLabel || "",
        ctaType: formData.cta.ctaType || "BOOK_A_CALL",
        aiAgentId: formData.cta.aiAgent || null,
        priceId: formData.cta.priceId || null,
        lockChat: formData.additionalInfo.lockChat || false,
        couponCode: formData.additionalInfo.couponEnabled
          ? formData.additionalInfo.couponCode || ""
          : null,
        couponEnabled: formData.additionalInfo.couponEnabled || false,
        presenterId: presenterId,
      },
    });

    revalidatePath("/");
    return {
      status: 200,
      message: "Webinar created successfully",
      webinarId: webinar.id,
      webinarLink: `/webinar/${webinar.id}`,
    };
  } catch (error) {
    console.log("Error creating webinar:", error);
    return {
      status: 500,
      message: "Internal server error while creating webinar",
    };
  }
};
