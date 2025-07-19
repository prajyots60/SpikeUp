"use server";

import { error } from "console";
import { OnAuthenticateUser } from "./auth";
import { stat } from "fs";
import { stripe } from "@/lib/stripe/index";

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
