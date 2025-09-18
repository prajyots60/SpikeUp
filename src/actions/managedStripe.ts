"use server";

import { OnAuthenticateUser } from "./auth";
import { stripe } from "@/lib/stripe/index";
import { prismaClient } from "@/lib/prismaClient";
import { changeAttendanceType } from "./attendance";

export const createManagedCreatorProduct = async (
  name: string,
  amount: number,
  currency: string = "usd",
  description?: string
) => {
  try {
    const currentUser = await OnAuthenticateUser();
    if (!currentUser.user) {
      return { success: false, status: 401, error: "User not authenticated" };
    }

    if (currentUser.user.creatorType !== "MANAGED_CREATOR") {
      return {
        success: false,
        status: 403,
        error: "Only managed creators can use this function",
      };
    }

    if (!name || !amount || amount <= 0) {
      return {
        success: false,
        status: 400,
        error: "Name and positive amount are required",
      };
    }

    const product = await stripe.products.create({
      name,
      description,
      metadata: {
        creatorId: currentUser.user.id,
        creatorEmail: currentUser.user.email,
        managed: "true",
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      currency: currency.toLowerCase(),
      unit_amount: Math.round(amount * 100),
      metadata: {
        creatorId: currentUser.user.id,
        managed: "true",
      },
    });

    // Set default price
    await stripe.products.update(product.id, {
      default_price: price.id,
    });

    const dbProduct = await prismaClient.product.create({
      data: {
        name,
        description,
        stripeProductId: product.id,
        stripePriceId: price.id,
        price: amount,
        currency: currency.toLowerCase(),
        creatorId: currentUser.user.id,
      },
    });

    return {
      success: true,
      status: 201,
      product: {
        id: dbProduct.id,
        stripeProductId: product.id,
        stripePriceId: price.id,
        name: product.name,
        description: product.description || null,
        price: amount,
        currency: currency.toLowerCase(),
        active: product.active,
        created: product.created,
      },
    };
  } catch (error) {
    console.error("Error creating managed creator product:", error);
    return {
      success: false,
      status: 500,
      error: "Failed to create product",
    };
  }
};

export const getManagedCreatorProducts = async () => {
  try {
    const currentUser = await OnAuthenticateUser();
    if (!currentUser.user) {
      return {
        error: "User not authenticated",
        status: 401,
        success: false,
      };
    }

    if (currentUser.user.creatorType !== "MANAGED_CREATOR") {
      return {
        error: "Only managed creators can use this function",
        status: 403,
        success: false,
      };
    }

    const products = await prismaClient.product.findMany({
      where: {
        creatorId: currentUser.user.id,
        isActive: true,
      },
      include: {
        earnings: {
          select: {
            amount: true,
            netAmount: true,
            isPaid: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const productsWithEarnings = products.map((product) => ({
      id: product.stripeProductId,
      name: product.name,
      description: product.description,
      active: product.isActive,
      created: Math.floor(product.createdAt.getTime() / 1000),
      default_price: {
        id: product.stripePriceId,
        unit_amount: Math.round(Number(product.price) * 100),
        currency: product.currency,
      },
      totalEarnings: product.earnings.reduce(
        (sum, e) => sum + Number(e.amount),
        0
      ),
      unpaidEarnings: product.earnings
        .filter((e) => !e.isPaid)
        .reduce((sum, e) => sum + Number(e.netAmount), 0),
    }));

    return {
      products: { data: productsWithEarnings },
      success: true,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching managed creator products:", error);
    return {
      error: "Failed to fetch products",
      status: 500,
      success: false,
    };
  }
};

export const createCheckoutLinkEnhanced = async (
  priceId: string,
  creatorId: string,
  attendeeId: string,
  webinarId: string,
  bookCall: boolean = false
) => {
  try {
    const creator = await prismaClient.user.findUnique({
      where: { id: creatorId },
      include: {
        products: {
          where: { stripePriceId: priceId },
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

    const sessionConfig: any = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      metadata: {
        attendeeId: attendeeId,
        webinarId: webinarId,
        bookCall: bookCall.toString(),
        creatorId: creator.id,
        creatorType: creator.creatorType,
      },
    };

    let session;

    if (creator.creatorType === "CONNECTED_STRIPE" && creator.stripeConnectId) {
      // Use connected account
      session = await stripe.checkout.sessions.create(sessionConfig, {
        stripeAccount: creator.stripeConnectId,
      });
    } else if (creator.creatorType === "MANAGED_CREATOR") {
      // Use platform account with application fee (optional)
      const product = creator.products[0];
      if (product) {
        sessionConfig.payment_intent_data = {
          metadata: {
            creatorId: creator.id,
            productId: product.id,
            attendeeId: attendeeId,
            webinarId: webinarId,
          },
        };
      }
      session = await stripe.checkout.sessions.create(sessionConfig);
    } else {
      return {
        error: "Creator payment setup incomplete",
        status: 400,
        success: false,
      };
    }

    if (bookCall) {
      await changeAttendanceType(attendeeId, webinarId, "ADDED_TO_CART");
    }

    return {
      sessionUrl: session.url,
      success: true,
      status: 200,
      message: "Checkout session created successfully",
    };
  } catch (error) {
    console.error("Error creating enhanced checkout session:", error);
    return {
      error: "Failed to create checkout session",
      status: 500,
      success: false,
    };
  }
};

export const toggleManagedProductActive = async (
  productId: string,
  makeActive: boolean
) => {
  try {
    const currentUser = await OnAuthenticateUser();
    if (!currentUser.user) {
      return { success: false, status: 401, error: "User not authenticated" };
    }

    const product = await prismaClient.product.findFirst({
      where: {
        stripeProductId: productId,
        creatorId: currentUser.user.id,
      },
    });

    if (!product) {
      return { success: false, status: 404, error: "Product not found" };
    }

    // Update in Stripe
    const stripeProduct = await stripe.products.update(productId, {
      active: makeActive,
    });

    // Update in database
    // const updatedProduct = await prismaClient.product.update({
    //   where: { id: product.id },
    //   data: { isActive: makeActive },
    // });

    return {
      success: true,
      status: 200,
      product: {
        id: stripeProduct.id,
        name: stripeProduct.name,
        description: stripeProduct.description || null,
        active: stripeProduct.active,
        created: stripeProduct.created,
        default_price: stripeProduct.default_price
          ? typeof stripeProduct.default_price === "string"
            ? { id: stripeProduct.default_price }
            : {
                id: (stripeProduct.default_price as any).id,
                unit_amount: (stripeProduct.default_price as any).unit_amount,
                currency: (stripeProduct.default_price as any).currency,
              }
          : null,
      },
    };
  } catch (error) {
    console.error("Error toggling managed product:", error);
    return {
      success: false,
      status: 500,
      error: "Failed to update product",
    };
  }
};

export const recordManagedCreatorEarning = async (
  paymentIntent: any,
  session?: any
) => {
  try {
    const creatorId = paymentIntent.metadata?.creatorId;
    const productId = paymentIntent.metadata?.productId;
    const attendeeId = paymentIntent.metadata?.attendeeId;
    const webinarId = paymentIntent.metadata?.webinarId;

    if (!creatorId) {
      console.log("No creator ID in payment metadata");
      return;
    }

    const product = await prismaClient.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      console.log("Product not found for earning recording");
      return;
    }

    const amount = paymentIntent.amount_received / 100; // Convert from cents
    const platformFeeRate = 0.1; // 10% platform fee (adjust as needed)
    const platformFee = amount * platformFeeRate;
    const netAmount = amount - platformFee;

    const earning = await prismaClient.earning.create({
      data: {
        amount: amount,
        currency: paymentIntent.currency,
        platformFee: platformFee,
        netAmount: netAmount,
        stripePaymentId: paymentIntent.id,
        stripeSessionId: session?.id,
        productId: product.id,
        creatorId: creatorId,
        webinarId: webinarId,
        attendeeId: attendeeId,
      },
    });

    // Update creator's pending balance
    await prismaClient.user.update({
      where: { id: creatorId },
      data: {
        pendingBalance: {
          increment: netAmount,
        },
        totalEarnings: {
          increment: amount,
        },
      },
    });

    console.log(`Recorded earning for creator ${creatorId}: $${netAmount}`);
    return earning;
  } catch (error) {
    console.error("Error recording managed creator earning:", error);
  }
};
