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

    // Handle managed creators
    if (currentUser.user.creatorType === "MANAGED_CREATOR") {
      const { getManagedCreatorProducts } = await import("./managedStripe");
      return await getManagedCreatorProducts();
    }

    // Handle connected creators
    if (!currentUser.user.stripeConnectId) {
      return {
        error: "User does not have a connected Stripe account",
        status: 403,
        success: false,
      };
    }

    const products = await stripe.products.list(
      { active: true },
      {
        stripeAccount: currentUser.user.stripeConnectId,
      }
    );

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

    // Handle managed creators
    if (currentUser.user.creatorType === "MANAGED_CREATOR") {
      const { getManagedCreatorProducts } = await import("./managedStripe");
      return await getManagedCreatorProducts();
    }

    // Handle connected creators
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
              id: p.default_price.id,

              unit_amount: p.default_price.unit_amount,

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

// Create a product + default price on a connected account or managed account
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

    // Handle managed creators
    if (currentUser.user.creatorType === "MANAGED_CREATOR") {
      const { createManagedCreatorProduct } = await import("./managedStripe");
      return await createManagedCreatorProduct(
        name,
        amount,
        currency,
        description
      );
    }

    // Handle connected creators
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

// Toggle product active (archive / unarchive)
export const toggleStripeProductActive = async (
  productId: string,
  makeActive: boolean
) => {
  try {
    const currentUser = await OnAuthenticateUser();
    if (!currentUser.user) {
      return { success: false, status: 401, error: "User not authenticated" };
    }

    // Handle managed creators
    if (currentUser.user.creatorType === "MANAGED_CREATOR") {
      const { toggleManagedProductActive } = await import("./managedStripe");
      return await toggleManagedProductActive(productId, makeActive);
    }

    // Handle connected creators
    if (!currentUser.user.stripeConnectId) {
      return {
        success: false,
        status: 403,
        error: "User does not have a connected Stripe account",
      };
    }
    if (!productId) {
      return { success: false, status: 400, error: "Product ID required" };
    }
    const stripeAccount = currentUser.user.stripeConnectId;
    const updated = await stripe.products.update(
      productId,
      { active: makeActive },
      { stripeAccount }
    );
    return {
      success: true,
      status: 200,
      product: {
        id: updated.id,
        name: updated.name,
        description: updated.description || null,
        active: updated.active,
        created: updated.created,
        default_price: updated.default_price
          ? typeof updated.default_price === "string"
            ? { id: updated.default_price }
            : {
                id: (updated.default_price as any).id,
                unit_amount: (updated.default_price as any).unit_amount,
                currency: (updated.default_price as any).currency,
              }
          : null,
      },
    };
  } catch (error) {
    console.error("Error toggling product active state:", error);
    return {
      success: false,
      status: 500,
      error: "Failed to update product",
    };
  }
};

// Delete product (Stripe will delete if not used, otherwise consider archiving)
export const deleteStripeProduct = async (productId: string) => {
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
    if (!productId) {
      return { success: false, status: 400, error: "Product ID required" };
    }
    const stripeAccount = currentUser.user.stripeConnectId;
    const deleted = await stripe.products.del(productId, { stripeAccount });
    return {
      success: deleted.deleted,
      status: 200,
      deleted: deleted.deleted,
      id: deleted.id,
    };
  } catch (error: any) {
    // If deletion fails (e.g., product has prices in use), surface message
    console.error("Error deleting product:", error);
    const message: string = error?.message || "";
    // Common Stripe constraint: cannot delete product with user-created prices -> fallback to archive
    if (
      /cannot be deleted because it has one or more user-created prices/i.test(
        message
      )
    ) {
      try {
        const currentUser = await OnAuthenticateUser();
        if (!currentUser.user?.stripeConnectId) {
          return {
            success: false,
            status: 403,
            error: "Missing connected account for fallback archive",
          };
        }
        const stripeAccount = currentUser.user.stripeConnectId;
        // Archive product
        const archived = await stripe.products.update(
          productId,
          { active: false },
          { stripeAccount }
        );
        // Additionally mark all its prices inactive (best-effort)
        const prices = await stripe.prices.list(
          { product: productId, limit: 100 },
          { stripeAccount }
        );
        await Promise.all(
          prices.data
            .filter((pr) => pr.active)
            .map((pr) =>
              stripe.prices.update(pr.id, { active: false }, { stripeAccount })
            )
        );
        return {
          success: true,
          status: 200,
          deleted: false,
          archived: true,
          id: archived.id,
          message: "Product archived instead (could not be deleted).",
        };
      } catch (fallbackErr: any) {
        console.error("Archive fallback failed:", fallbackErr);
        return {
          success: false,
          status: 500,
          error:
            fallbackErr?.message ||
            "Failed to delete or archive product. Try manually via Stripe dashboard.",
        };
      }
    }
    return {
      success: false,
      status: 500,
      error:
        message ||
        "Failed to delete product (it may have active prices/subscriptions). Try deactivating instead.",
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

    // Try enhanced checkout that handles both connected and managed creators
    const { createCheckoutLinkEnhanced } = await import("./managedStripe");

    // Find creator by webinar
    const webinar = await prismaClient.webinar.findUnique({
      where: { id: webinarId },
      include: { presenter: true },
    });

    if (webinar?.presenter) {
      return await createCheckoutLinkEnhanced(
        priceId,
        webinar.presenter.id,
        attendeeId,
        webinarId,
        bookCall
      );
    }

    // Fallback to original implementation for backward compatibility
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
