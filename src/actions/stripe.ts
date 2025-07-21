"use server";

import { OnAuthenticateUser } from "./auth";
import { stripe } from "@/lib/stripe/index";
import Stripe from "stripe";
import { prismaClient } from "@/lib/prismaClient";
import { subscriptionPriceId } from "@/lib/data";

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

    const products = await stripe.products.list(
      {}
      //{TODO: Uncomment when needed}
      //   {
      //     stripeAccount: currentUser.user.stripeConnectId,
      //   }
    );

    return {
      products: products.data,
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
