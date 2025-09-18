"use server";

import { OnAuthenticateUser } from "./auth";
import { prismaClient } from "@/lib/prismaClient";
import { stripe } from "@/lib/stripe/index";
import { CreatorTypeEnum } from "@prisma/client";
import { serializeUserWithDecimals } from "@/lib/utils/serialize";

// Get creator details with earnings summary
export const getCreatorDetails = async (creatorId?: string) => {
  try {
    const currentUser = await OnAuthenticateUser();
    if (!currentUser.user) {
      return {
        error: "User not authenticated",
        status: 401,
        success: false,
      };
    }

    const targetCreatorId = creatorId || currentUser.user.id;

    const creator = await prismaClient.user.findUnique({
      where: { id: targetCreatorId },
      include: {
        products: {
          where: { isActive: true },
          include: {
            earnings: {
              select: {
                amount: true,
                netAmount: true,
                isPaid: true,
              },
            },
          },
        },
        earnings: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            product: true,
          },
        },
        payouts: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!creator) {
      return {
        error: "Creator not found",
        status: 404,
        success: false,
      };
    }

    const totalEarnings = creator.earnings.reduce(
      (sum, earning) => sum + Number(earning.amount),
      0
    );
    const unpaidEarnings = creator.earnings
      .filter((earning) => !earning.isPaid)
      .reduce((sum, earning) => sum + Number(earning.netAmount), 0);

    // Use utility function to serialize all Decimal fields
    const serializedCreator = serializeUserWithDecimals(creator);

    // Override with computed values
    serializedCreator.totalEarnings = totalEarnings;
    serializedCreator.unpaidEarnings = unpaidEarnings;

    return {
      creator: serializedCreator,
      success: true,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching creator details:", error);
    return {
      error: "Failed to fetch creator details",
      status: 500,
      success: false,
    };
  }
};

// Update creator type (for current user)
export const updateCreatorType = async (creatorType: CreatorTypeEnum) => {
  try {
    const currentUser = await OnAuthenticateUser();
    if (!currentUser.user) {
      return {
        error: "User not authenticated",
        status: 401,
        success: false,
      };
    }

    const updatedCreator = await prismaClient.user.update({
      where: { id: currentUser.user.id },
      data: { creatorType },
    });

    return {
      creator: updatedCreator,
      success: true,
      status: 200,
    };
  } catch (error) {
    console.error("Error updating creator type:", error);
    return {
      error: "Failed to update creator type",
      status: 500,
      success: false,
    };
  }
};

// Update creator type for another user (admin only)
export const updateCreatorTypeForUser = async (
  creatorId: string,
  creatorType: CreatorTypeEnum
) => {
  try {
    const currentUser = await OnAuthenticateUser();
    if (!currentUser.user) {
      return {
        error: "User not authenticated",
        status: 401,
        success: false,
      };
    }

    // Add admin check here if needed
    // For now, any authenticated user can update

    const updatedCreator = await prismaClient.user.update({
      where: { id: creatorId },
      data: { creatorType },
    });

    return {
      creator: updatedCreator,
      success: true,
      status: 200,
    };
  } catch (error) {
    console.error("Error updating creator type:", error);
    return {
      error: "Failed to update creator type",
      status: 500,
      success: false,
    };
  }
};

// Get all managed creators (admin view)
export const getAllManagedCreators = async () => {
  try {
    const currentUser = await OnAuthenticateUser();
    if (!currentUser.user) {
      return {
        error: "User not authenticated",
        status: 401,
        success: false,
      };
    }

    // Add admin check here if needed

    const creators = await prismaClient.user.findMany({
      where: {
        creatorType: "MANAGED_CREATOR",
        isActive: true,
      },
      include: {
        products: {
          where: { isActive: true },
        },
        earnings: {
          where: { isPaid: false },
          select: {
            netAmount: true,
          },
        },
        _count: {
          select: {
            webinars: true,
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const creatorsWithSummary = creators.map((creator) => ({
      ...creator,
      unpaidEarnings: creator.earnings.reduce(
        (sum, earning) => sum + Number(earning.netAmount),
        0
      ),
      totalProducts: creator._count.products,
      totalWebinars: creator._count.webinars,
    }));

    return {
      creators: creatorsWithSummary,
      success: true,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching managed creators:", error);
    return {
      error: "Failed to fetch managed creators",
      status: 500,
      success: false,
    };
  }
};

// Switch creator to managed mode
export const switchToManagedCreator = async () => {
  try {
    const currentUser = await OnAuthenticateUser();
    if (!currentUser.user) {
      return {
        error: "User not authenticated",
        status: 401,
        success: false,
      };
    }

    const updatedUser = await prismaClient.user.update({
      where: { id: currentUser.user.id },
      data: {
        creatorType: "MANAGED_CREATOR",
        // Clear Stripe Connect ID since they'll use platform account
        stripeConnectId: null,
      },
    });

    return {
      user: updatedUser,
      success: true,
      status: 200,
      message: "Successfully switched to managed creator mode",
    };
  } catch (error) {
    console.error("Error switching to managed creator:", error);
    return {
      error: "Failed to switch to managed creator mode",
      status: 500,
      success: false,
    };
  }
};
