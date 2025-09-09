"use server";

import { OnAuthenticateUser } from "./auth";
import { stripe } from "@/lib/stripe/index";
import Stripe from "stripe";
import { prismaClient } from "@/lib/prismaClient";
import { subscriptionPriceId } from "@/lib/data";
import { changeAttendanceType } from "./attendance";

export const getAllProductsFromStripe = async () => {
  try {
    const currentUser = await OnAuthenticateUser();

    if (!currentUser.user) {
      return {
        error: "User not authenticated",
        status: 401,
        success: false,
      };
    }

    if (!currentUser.user.stripeConnectId) {
      return {
        error: "User does not have a connected Stripe account",
        status: 403,
        success: false,
      };
    }

    const products = await stripe.products.list({
      stripeAccount: currentUser.user.stripeConnectId,
    });

    return {
      products: products,
      success: true,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      error: "Failed to fetch products",
      status: 500,
      success: false,
    };
  }
};

export const getAllProductsFromStripeSettings = async () => {
  try {
    const currentUser = await OnAuthenticateUser();

    if (!currentUser.user) {
      return {
        error: "User not authenticated",
        status: 401,
        success: false,
      };
    }

    if (!currentUser.user.stripeConnectId) {
      return {
        error: "User does not have a connected Stripe account",
        status: 403,
        success: false,
      };
    }

    const products = await stripe.products.list(
      {
        limit: 100,
        expand: ["data.default_price"],
      },
      { stripeAccount: currentUser.user.stripeConnectId }
    );

    const sanitized = products.data.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || null,
      active: p.active,
      created: p.created,
      default_price:
        p.default_price && typeof p.default_price === "object"
          ? {
              // @ts-ignore runtime shape from expansion
              id: p.default_price.id,
              // @ts-ignore
              unit_amount: p.default_price.unit_amount,
              // @ts-ignore
              currency: p.default_price.currency,
            }
          : null,
    }));

    return {
      products: sanitized,
      success: true,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      error: "Failed to fetch products",
      status: 500,
      success: false,
    };
  }
};

// Create a product + default price on a connected account
export const createStripeProduct = async (
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
    if (!currentUser.user.stripeConnectId) {
      return {
        success: false,
        status: 403,
        error: "User does not have a connected Stripe account",
      };
    }

    if (!name || !amount || amount <= 0) {
      return {
        success: false,
        status: 400,
        error: "Name and positive amount are required",
      };
    }

    const stripeAccount = currentUser.user.stripeConnectId;

    const product = await stripe.products.create(
      {
        name,
        description,
      },
      { stripeAccount }
    );

    const price = await stripe.prices.create(
      {
        product: product.id,
        currency: currency.toLowerCase(),
        unit_amount: Math.round(amount * 100), // amount in dollars -> cents
      },
      { stripeAccount }
    );

    // Set default price for easier retrieval later
    await stripe.products.update(
      product.id,
      { default_price: price.id },
      { stripeAccount }
    );

    return {
      success: true,
      status: 201,
      product: {
        id: product.id,
        name: product.name,
        description: product.description || null,
        active: product.active,
        created: product.created,
        default_price: {
          id: price.id,
          unit_amount: price.unit_amount,
          currency: price.currency,
        },
      },
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      status: 500,
      error: "Failed to create product",
    };
  }
};

export const onGetStripeClientSecret = async (
  email: string,
  userId: string
) => {
  try {
    let customer: Stripe.Customer;
    const existingCustomer = await stripe.customers.list({ email: email });
    if (existingCustomer.data.length > 0) {
      customer = existingCustomer.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
        },
      });
    }

    await prismaClient.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customer.id,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: subscriptionPriceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        userId: userId,
        email: email,
        subscriptionPriceId: subscriptionPriceId,
      },
    });

    const paymentIntent = (subscription.latest_invoice as Stripe.Invoice)
      .payment_intent as Stripe.PaymentIntent;

    return {
      secret: paymentIntent.client_secret,
      success: true,
      status: 200,
      customerId: customer.id,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      error: "Failed to create subscription",
      status: 500,
      success: false,
    };
  }
};

export const updateSubscriptionEvent = async (
  subscription: Stripe.Subscription
) => {
  try {
    const userId = subscription.metadata.userId;
    await prismaClient.user.update({
      where: { id: userId },
      data: {
        subscription: subscription.status === "active" ? true : false,
      },
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
  }
};

export const createCheckoutLink = async (
  priceId: string,
  stripeId: string,
  attendeeId: string,
  webinarId: string,
  bookCall: boolean = false
) => {
  try {
    console.log(
      "Logging details: ",
      priceId,
      stripeId,
      attendeeId,
      webinarId,
      bookCall
    );
    const session = await stripe.checkout.sessions.create(
      {
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
        },
      },
      {
        stripeAccount: stripeId,
      }
    );

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
    console.error("Error creating checkout session:", error);
    return {
      error: "Failed to create checkout session",
      status: 500,
      success: false,
    };
  }
};
