"use server";

import { prismaClient } from "@/lib/prismaClient";
import { AttendanceData } from "@/lib/type";
import { AttendedTypeEnum, CtaTypeEnum } from "@prisma/client";

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
              createdAt: attendance.createdAt,
              updatedAt: attendance.updatedAt,
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
