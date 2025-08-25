"use server";

import { WebinarFormState } from "@/store/useWebinarStore";
import { OnAuthenticateUser } from "./auth";
import { prismaClient } from "@/lib/prismaClient";
import { revalidatePath } from "next/cache";
import { WebinarStatusEnum } from "@prisma/client";
import { combineLocalDateTime } from "@/lib/utils";

export const createWebinar = async (formData: WebinarFormState) => {
  try {
    // Log server timezone information for debugging
    const serverTime = new Date();
    console.log("Server timezone info:", {
      serverTime: serverTime.toISOString(),
      localTime: serverTime.toString(),
      timezoneOffset: serverTime.getTimezoneOffset(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    const user = await OnAuthenticateUser();

    if (!user.user) {
      throw new Error("User not authenticated");
    }

    if (!user.user.subscription) {
      return {
        status: 402,
        message: "You need to have a subscription to create a webinar",
      };
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

    const combinedDateTime = combineLocalDateTime(
      formData.basicInfo.date!,
      formData.basicInfo.time,
      formData.basicInfo.timeFormat || "AM"
    );

    // Add a small buffer (5 minutes) to account for processing time and timezone differences
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const minimumDateTime = new Date(now.getTime() - bufferTime);

    // Debug logging for timezone issues
    console.log("Webinar date validation:", {
      inputDate: formData.basicInfo.date,
      inputTime: formData.basicInfo.time,
      inputTimeFormat: formData.basicInfo.timeFormat,
      combinedDateTime: combinedDateTime.toISOString(),
      serverTime: now.toISOString(),
      minimumDateTime: minimumDateTime.toISOString(),
      timezoneOffset: now.getTimezoneOffset(),
      isValidTime: combinedDateTime >= minimumDateTime,
    });

    if (combinedDateTime < minimumDateTime) {
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

export const getWebinarsByPresenterId = async (
  presenterId: string,
  webinarStatus?: string
) => {
  try {
    let statusFilter: WebinarStatusEnum | undefined;

    switch (webinarStatus) {
      case "upcoming":
        statusFilter = WebinarStatusEnum.SCHEDULED;
        break;
      case "live":
        statusFilter = WebinarStatusEnum.LIVE;
        break;
      case "ended":
        statusFilter = WebinarStatusEnum.ENDED;
        break;
      default:
        statusFilter = undefined; // No filter
    }
    const webinars = await prismaClient.webinar.findMany({
      where: { presenterId, webinarStatus: statusFilter },
      include: {
        presenter: {
          select: {
            name: true,
            stripeConnectId: true,
            id: true,
          },
        },
      },
    });
    return webinars;
  } catch (error) {
    console.error("Error fetching webinars:", error);
    return [];
  }
};

export const getWebinarById = async (webinarId: string) => {
  try {
    const webinar = await prismaClient.webinar.findUnique({
      where: { id: webinarId },
      include: {
        presenter: {
          select: {
            id: true,
            name: true,
            stripeConnectId: true,
            profileImage: true,
          },
        },
      },
    });

    return webinar;
  } catch (error) {
    console.error("Error fetching webinar by ID:", error);
    throw new Error("Webinar not found");
  }
};

export const changeWebinarStatus = async (
  webinarId: string,
  status: WebinarStatusEnum
) => {
  try {
    const webinar = await prismaClient.webinar.update({
      where: { id: webinarId },
      data: { webinarStatus: status },
    });

    return {
      status: 200,
      message: "Webinar status updated successfully",
      webinar,
      success: true,
    };
  } catch (error) {
    console.error("Error changing webinar status:", error);
    return {
      status: 500,
      message: "Internal server error while changing webinar status",
      success: false,
    };
  }
};
