"use server";

import { prismaClient } from "@/lib/prismaClient";
import { AttendanceData } from "@/lib/type";
import { AttendedTypeEnum, CallStatusEnum, CtaTypeEnum } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const getWebinarAttendance = async (
  webinarId: string,
  options: {
    includeUsers?: boolean;
    userLimit?: number;
  } = { includeUsers: true, userLimit: 100 }
) => {
  try {
    const webinar = await prismaClient.webinar.findUnique({
      where: { id: webinarId },
      select: {
        id: true,
        ctaType: true,
        tags: true,
        presenter: true,
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });
    if (!webinar) {
      return {
        success: false,
        status: 404,
        message: "Webinar not found",
      };
    }

    const attendanceCounts = await prismaClient.attendance.groupBy({
      by: ["attendedType"],
      where: { webinarId },
      _count: {
        attendedType: true,
      },
    });

    const result: Record<AttendedTypeEnum, AttendanceData> = {} as Record<
      AttendedTypeEnum,
      AttendanceData
    >;

    for (const type of Object.values(AttendedTypeEnum)) {
      if (
        type === AttendedTypeEnum.ADDED_TO_CART &&
        webinar.ctaType === CtaTypeEnum.BOOK_A_CALL
      )
        continue;

      if (
        type === AttendedTypeEnum.BREAKOUT_ROOM &&
        webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL
      )
        continue;

      const countItem = attendanceCounts.find((item) => {
        if (
          webinar.ctaType === CtaTypeEnum.BOOK_A_CALL &&
          item.attendedType === AttendedTypeEnum.ADDED_TO_CART &&
          type === AttendedTypeEnum.BREAKOUT_ROOM
        ) {
          return true;
        }

        return item.attendedType === type;
      });

      result[type] = {
        count: countItem ? countItem._count.attendedType : 0,
        users: [],
      };

      if (options.includeUsers) {
        for (const userType of Object.values(AttendedTypeEnum)) {
          if (
            (userType === AttendedTypeEnum.ADDED_TO_CART &&
              webinar.ctaType === CtaTypeEnum.BOOK_A_CALL) ||
            (userType === AttendedTypeEnum.BREAKOUT_ROOM &&
              webinar.ctaType !== CtaTypeEnum.BOOK_A_CALL)
          )
            continue;

          const queryType =
            webinar.ctaType === CtaTypeEnum.BOOK_A_CALL &&
            userType === AttendedTypeEnum.BREAKOUT_ROOM
              ? AttendedTypeEnum.ADDED_TO_CART
              : userType;

          if (result[userType] && result[userType].count > 0) {
            const attendances = await prismaClient.attendance.findMany({
              where: {
                webinarId,
                attendedType: queryType,
              },
              include: {
                user: true,
              },
              take: options.userLimit || 100,
              orderBy: {
                joinedAt: "desc",
              },
            });

            result[userType].users = attendances.map((attendance) => ({
              id: attendance.user.id,
              name: attendance.user.name,
              email: attendance.user.email,
              attendedAt: attendance.joinedAt,
              createdAt: attendance.user.createdAt,
              updatedAt: attendance.user.updatedAt,
              stripeConnectedId: null,
              callStatus: attendance.user.callStatus,
            }));
          }
        }
      }
    }
    return {
      success: true,
      status: 200,
      data: result,
      ctaType: webinar.ctaType,
      webinarTags: webinar.tags || [],
      presenter: webinar.presenter,
    };
  } catch (error) {
    console.error("Error fetching webinar attendance:", error);
    return {
      success: false,
      status: 500,
      message: "Internal server error",
    };
  }
};

export const registerAttendee = async ({
  webinarId,
  email,
  name,
}: {
  webinarId: string;
  email: string;
  name: string;
}) => {
  try {
    if (!webinarId || !email || !name) {
      return {
        error: "Missing required fields",
        status: 400,
        success: false,
      };
    }

    const webinar = await prismaClient.webinar.findUnique({
      where: { id: webinarId },
    });
    if (!webinar) {
      return {
        error: "Webinar not found",
        status: 404,
        success: false,
      };
    }

    let attendee = await prismaClient.attendee.findFirst({
      where: { email },
    });

    if (!attendee) {
      attendee = await prismaClient.attendee.create({
        data: {
          email,
          name,
        },
      });
    }

    const existingAttendance = await prismaClient.attendance.findFirst({
      where: {
        attendeeId: attendee.id,
        webinarId,
      },
      include: {
        user: true,
      },
    });

    if (existingAttendance) {
      return {
        success: true,
        status: 200,
        data: existingAttendance,
        message: "Already registered",
      };
    }

    const attendance = await prismaClient.attendance.create({
      data: {
        attendedType: AttendedTypeEnum.REGISTERED,
        attendeeId: attendee.id,
        webinarId,
      },
      include: {
        user: true,
      },
    });

    revalidatePath(`${webinarId}`);

    return {
      success: true,
      status: 201,
      data: attendance,
      message: "Successfully registered",
    };
  } catch (error) {
    console.error("Error registering attendee:", error);
    return {
      error: "Failed to register attendee",
      status: 500,
      success: false,
    };
  }
};

export const changeAttendanceType = async (
  attendeeId: string,
  webinarId: string,
  attendedType: AttendedTypeEnum
) => {
  try {
    const attendance = await prismaClient.attendance.update({
      where: {
        attendeeId_webinarId: {
          attendeeId,
          webinarId,
        },
      },
      data: {
        attendedType,
      },
    });

    return {
      success: true,
      status: 200,
      data: attendance,
      message: "Attendance type updated successfully",
    };
  } catch (error) {
    console.error("Error updating attendance type:", error);
    return {
      success: false,
      status: 500,
      message: "Failed to update attendance type",
      error,
    };
  }
};

export const getAttendeeById = async (id: string, webinarId: string) => {
  try {
    const attendee = await prismaClient.attendee.findUnique({
      where: {
        id,
      },
    });

    const attendance = await prismaClient.attendance.findFirst({
      where: {
        attendeeId: id,
        webinarId,
      },
    });

    if (!attendee || !attendance) {
      return {
        status: 404,
        success: false,
        message: "Attendee or attendance not found",
      };
    }

    return {
      status: 200,
      success: true,
      message: "Get attendee details successfully",
      data: attendee,
    };
  } catch (error) {
    console.error("Error fetching attendee by ID:", error);
    return {
      status: 500,
      success: false,
      message: "Internal server error",
    };
  }
};

export const changeCallStatus = async (
  attendeeId: string,
  callStatus: CallStatusEnum
) => {
  try {
    const attendee = await prismaClient.attendee.update({
      where: {
        id: attendeeId,
      },
      data: {
        callStatus,
      },
    });

    if (!attendee) {
      return {
        success: false,
        status: 404,
        message: "Attendee not found",
      };
    }

    return {
      success: true,
      status: 200,
      data: attendee,
      message: "Call status updated successfully",
    };
  } catch (error) {
    console.error("Error updating call status:", error);
    return {
      success: false,
      status: 500,
      message: "Failed to update call status",
      error,
    };
  }
};
