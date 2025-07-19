import { prismaClient } from "@/lib/prismaClient";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  try {
    if (!code || !state) {
      console.log("Missing code or state in the request", { code, state });
      return NextResponse.redirect(
        new URL(
          `/settings?success=false&message=Missing code or state`,
          request.url
        )
      );
    }

    console.log("Received code and state", { code, state });

    try {
      const response = await stripe.oauth.token({
        grant_type: "authorization_code",
        code,
      });

      if (!response.stripe_user_id) {
        throw new Error("Stripe user ID is missing in the response");
      }

      await prismaClient.user.update({
        where: { id: state },
        data: {
          stripeConnectId: response.stripe_user_id,
        },
      });

      console.log("Successfully connected Stripe account", {
        userId: state,
        stripeConnectId: response.stripe_user_id,
      });

      return NextResponse.redirect(
        new URL(
          `/settings?success=true&message=Successfully+connected+your+Stripe+account`,
          request.url
        )
      );
    } catch (stripeError) {
      console.error("Error connecting Stripe account", stripeError);
      return NextResponse.redirect(
        new URL(
          `/settings?success=false&message=${encodeURIComponent(
            (stripeError as Error).message
          )}`,
          request.url
        )
      );
    }
  } catch (error) {
    console.error("Unexpected error in Stripe connect route", error);
    return NextResponse.redirect(
      new URL(
        `/settings?success=false&message=Unexpected+error+occurred`,
        request.url
      )
    );
  }
}
