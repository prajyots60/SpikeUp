"use server";

import { OnAuthenticateUser } from "./auth";
import { prismaClient } from "@/lib/prismaClient";
import { stripe } from "@/lib/stripe/index";

// Create a payout for a managed creator
export const createCreatorPayout = async (
  creatorId: string,
  amount: number,
  method: string = "manual",
  notes?: string
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

    // Admin check (you might want to implement proper admin roles)
    // For now, allowing any authenticated user to create payouts

    const creator = await prismaClient.user.findUnique({
      where: { id: creatorId },
      include: {
        earnings: {
          where: { isPaid: false },
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

    if (creator.creatorType !== "MANAGED_CREATOR") {
      return {
        error: "Only managed creators can receive payouts",
        status: 400,
        success: false,
      };
    }

    const unpaidEarnings = creator.earnings.reduce(
      (sum, earning) => sum + Number(earning.netAmount),
      0
    );

    if (amount > unpaidEarnings) {
      return {
        error: "Payout amount exceeds unpaid earnings",
        status: 400,
        success: false,
      };
    }

    // Create payout record
    const payout = await prismaClient.payout.create({
      data: {
        amount,
        currency: "usd",
        method,
        status: "pending",
        creatorId,
        notes,
      },
    });

    // Mark earnings as paid up to the payout amount
    let remainingAmount = amount;
    const earningsToUpdate = [];

    for (const earning of creator.earnings) {
      if (remainingAmount <= 0) break;

      const earningAmount = Number(earning.netAmount);
      if (earningAmount <= remainingAmount) {
        earningsToUpdate.push(earning.id);
        remainingAmount -= earningAmount;
      }
    }

    // Update earnings to mark as paid
    await prismaClient.earning.updateMany({
      where: { id: { in: earningsToUpdate } },
      data: {
        isPaid: true,
        paidAt: new Date(),
        payoutId: payout.id,
      },
    });

    // Update creator's pending balance
    await prismaClient.user.update({
      where: { id: creatorId },
      data: {
        pendingBalance: {
          decrement: amount,
        },
      },
    });

    return {
      payout,
      success: true,
      status: 201,
      message: "Payout created successfully",
    };
  } catch (error) {
    console.error("Error creating payout:", error);
    return {
      error: "Failed to create payout",
      status: 500,
      success: false,
    };
  }
};

// Get payouts for a creator
export const getCreatorPayouts = async (creatorId?: string) => {
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

    const payouts = await prismaClient.payout.findMany({
      where: { creatorId: targetCreatorId },
      include: {
        earnings: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Serialize decimal values
    const serializedPayouts = payouts.map((payout) => ({
      ...payout,
      amount: Number(payout.amount),
      earnings: payout.earnings.map((earning) => ({
        ...earning,
        amount: Number(earning.amount),
        netAmount: Number(earning.netAmount),
        platformFee: Number(earning.platformFee),
        product: earning.product
          ? {
              ...earning.product,
              price: Number(earning.product.price),
            }
          : null,
      })),
    }));

    return {
      payouts: serializedPayouts,
      success: true,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return {
      error: "Failed to fetch payouts",
      status: 500,
      success: false,
    };
  }
};

// Update payout status
export const updatePayoutStatus = async (
  payoutId: string,
  status: string,
  stripeTransferId?: string
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

    const payout = await prismaClient.payout.update({
      where: { id: payoutId },
      data: {
        status,
        stripeTransferId,
        processedAt: status === "completed" ? new Date() : undefined,
      },
    });

    return {
      payout,
      success: true,
      status: 200,
      message: "Payout status updated successfully",
    };
  } catch (error) {
    console.error("Error updating payout status:", error);
    return {
      error: "Failed to update payout status",
      status: 500,
      success: false,
    };
  }
};

// Get earnings report for a creator
export const getCreatorEarningsReport = async (
  creatorId?: string,
  startDate?: Date,
  endDate?: Date
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

    const targetCreatorId = creatorId || currentUser.user.id;

    const whereClause: any = { creatorId: targetCreatorId };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const earnings = await prismaClient.earning.findMany({
      where: whereClause,
      include: {
        product: true,
        payout: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const summary = {
      totalEarnings: earnings.reduce((sum, e) => sum + Number(e.amount), 0),
      totalPlatformFees: earnings.reduce(
        (sum, e) => sum + Number(e.platformFee),
        0
      ),
      totalNetEarnings: earnings.reduce(
        (sum, e) => sum + Number(e.netAmount),
        0
      ),
      paidEarnings: earnings
        .filter((e) => e.isPaid)
        .reduce((sum, e) => sum + Number(e.netAmount), 0),
      unpaidEarnings: earnings
        .filter((e) => !e.isPaid)
        .reduce((sum, e) => sum + Number(e.netAmount), 0),
      totalTransactions: earnings.length,
    };

    // Serialize decimal values
    const serializedEarnings = earnings.map((earning) => ({
      ...earning,
      amount: Number(earning.amount),
      netAmount: Number(earning.netAmount),
      platformFee: Number(earning.platformFee),
      product: earning.product
        ? {
            ...earning.product,
            price: Number(earning.product.price),
          }
        : null,
      payout: earning.payout
        ? {
            ...earning.payout,
            amount: Number(earning.payout.amount),
          }
        : null,
    }));

    return {
      earnings: serializedEarnings,
      summary,
      success: true,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching earnings report:", error);
    return {
      error: "Failed to fetch earnings report",
      status: 500,
      success: false,
    };
  }
};

// Get all managed creators with earnings summary (admin view)
export const getAllCreatorsEarningsSummary = async () => {
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
        earnings: {
          select: {
            amount: true,
            netAmount: true,
            isPaid: true,
            createdAt: true,
          },
        },
        payouts: {
          select: {
            amount: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            products: true,
            webinars: true,
          },
        },
      },
    });

    const summary = creators.map((creator) => {
      const totalEarnings = creator.earnings.reduce(
        (sum, e) => sum + Number(e.amount),
        0
      );
      const unpaidEarnings = creator.earnings
        .filter((e) => !e.isPaid)
        .reduce((sum, e) => sum + Number(e.netAmount), 0);
      const totalPayouts = creator.payouts.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      return {
        id: creator.id,
        name: creator.name,
        email: creator.email,
        totalEarnings,
        unpaidEarnings,
        totalPayouts,
        productCount: creator._count.products,
        webinarCount: creator._count.webinars,
        lastEarning: creator.earnings[0]?.createdAt || null,
      };
    });

    return {
      creators: summary,
      success: true,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching creators earnings summary:", error);
    return {
      error: "Failed to fetch creators earnings summary",
      status: 500,
      success: false,
    };
  }
};
