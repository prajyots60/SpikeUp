"use server";

import { WebinarFormState } from "@/store/useWebinarStore";
import { OnAuthenticateUser } from "./auth";
import { prismaClient } from "@/lib/prismaClient";
import { combineISTDateTimeToUTC } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { WebinarStatusEnum, type Prisma } from "@prisma/client";

// Deprecated in favor of combineISTDateTimeToUTC in utils

export const createWebinar = async (formData: WebinarFormState) => {
  try {
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

    // Expect date as YYYY-MM-DD (IST calendar) from client; combine to a UTC instant
    const combinedDateTime = combineISTDateTimeToUTC(
      String(formData.basicInfo.date),
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
        // File upload fields
        recordingUrl: formData.basicInfo.videoUrl || null,
        recordingKey: formData.basicInfo.videoKey || null,
        thumbnail: formData.basicInfo.thumbnailUrl || null,
        thumbnailKey: formData.basicInfo.thumbnailKey || null,
        isPreRecorded: formData.basicInfo.isPreRecorded || false,
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
  webinarStatus?: string,
  search?: string
) => {
  try {
    const where: Prisma.WebinarWhereInput = { presenterId };

    switch (webinarStatus) {
      case "upcoming":
        where.webinarStatus = {
          in: [WebinarStatusEnum.SCHEDULED, WebinarStatusEnum.WAITING_ROOM],
        };
        break;
      case "live":
        where.webinarStatus = WebinarStatusEnum.LIVE;
        break;
      case "ended":
        where.webinarStatus = WebinarStatusEnum.ENDED;
        break;
      default:
      // leave unfiltered
    }

    if (search && search.trim()) {
      where.title = { contains: search.trim(), mode: "insensitive" };
    }

    const webinars = await prismaClient.webinar.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
            creatorType: true,
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

export const getRecordedWebinarById = async (webinarId: string) => {
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
            creatorType: true,
          },
        },
      },
    });

    if (!webinar) {
      return {
        status: 404,
        message: "Webinar not found",
        webinar: null,
      };
    }

    if (!webinar.isPreRecorded) {
      return {
        status: 400,
        message: "This webinar is not pre-recorded",
        webinar: null,
        redirectTo: `/live-webinar/${webinarId}`,
      };
    }

    if (!webinar.recordingUrl) {
      return {
        status: 400,
        message: "No recording available for this webinar",
        webinar: null,
      };
    }

    return {
      status: 200,
      message: "Webinar found successfully",
      webinar,
    };
  } catch (error) {
    console.error("Error fetching recorded webinar:", error);
    return {
      status: 500,
      message: "Internal server error while fetching webinar",
      webinar: null,
    };
  }
};
