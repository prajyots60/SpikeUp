// import { changeAttendanceType } from "@/actions/attendance";
// import { updateSubscriptionEvent } from "@/actions/stripe";
// import { stripe } from "@/lib/stripe/index";
// import { headers } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";
// import Stripe from "stripe";

// const STRIPE_SUBSCRIPTION_EVENTS = new Set([
//   "invoice.created",
//   "invoice.finalized",
//   "invoice.paid",
//   "checkout.session.completed",
//   "customer.subscription.created",
//   "customer.subscription.updated",
//   "customer.subscription.deleted",
// ]);

// const getStripeEvent = async (
//   body: string,
//   sig: string | null
// ): Promise<Stripe.Event> => {
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
//   if (!sig || !webhookSecret) {
//     throw new Error("Missing Stripe signature or webhook secret");
//   }

//   return stripe.webhooks.constructEvent(body, sig, webhookSecret);
// };

// export async function POST(req: NextRequest) {
//   console.log("Received Stripe webhook event");
//   const body = await req.text();

//   const signature = (await headers()).get("Stripe-Signature");

//   try {
//     const stripeEvent = await getStripeEvent(body, signature);
//     if (!STRIPE_SUBSCRIPTION_EVENTS.has(stripeEvent.type)) {
//       console.log(`Unhandled Stripe event type: ${stripeEvent.type}`);
//       return NextResponse.json({ received: true }, { status: 200 });
//     }

//     const event = stripeEvent.data.object as Stripe.Subscription;
//     const metadata = event.metadata;

//     if (!metadata) {
//       console.log("No metadata found in Stripe event");
//       return NextResponse.json({ received: true }, { status: 200 });
//     }

//     if (
//       metadata.connectAccountPayments ||
//       metadata.connectAccountSubscriptions
//     ) {
//       console.log("Skipping event for connected account");

//       //Keep track of leads conversion
//       if (event.metadata && event.metadata.attendeeId) {
//         switch (stripeEvent.type) {
//           case "checkout.session.completed":
//             await changeAttendanceType(
//               event?.metadata?.attendeeId,
//               event?.metadata?.webinarId,
//               "CONVERTED"
//             );
//         }
//       }

//       return NextResponse.json(
//         { message: "Skipping event for connected account" },
//         { status: 200 }
//       );
//     }

//     switch (stripeEvent.type) {
//       case "checkout.session.completed":
//       case "customer.subscription.created":
//       case "customer.subscription.updated":
//         // Handle subscription creation or update
//         await updateSubscriptionEvent(event);
//         console.log("Created from Webhook:", event);
//         return NextResponse.json({ received: true }, { status: 200 });
//       default:
//         console.log(`Unhandled event type: ${stripeEvent.type}`);
//         return NextResponse.json({ received: true }, { status: 200 });
//     }
//   } catch (error: any) {
//     console.error("Error processing Stripe webhook:", error);
//     return new Response("Webhook Error" + error, {
//       status: error.statusCode || 400,
//     });
//   }
// }

import { changeAttendanceType } from "@/actions/attendance";
import { updateSubscriptionEvent } from "@/actions/stripe";
import { stripe } from "@/lib/stripe/index";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_SUBSCRIPTION_EVENTS = new Set([
  "invoice.created",
  "invoice.finalized",
  "invoice.paid",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

const getStripeEvent = (body: Buffer, sig: string | null): Stripe.Event => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    throw new Error("Missing Stripe signature or webhook secret");
  }

  return stripe.webhooks.constructEvent(body, sig, webhookSecret);
};

export async function POST(req: NextRequest) {
  console.log("📩 Received Stripe webhook event");

  // ✅ Use arrayBuffer and convert to Buffer
  const body = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get("stripe-signature");

  try {
    const stripeEvent = getStripeEvent(body, signature);

    if (!STRIPE_SUBSCRIPTION_EVENTS.has(stripeEvent.type)) {
      console.log(`⚠️ Unhandled Stripe event type: ${stripeEvent.type}`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const event = stripeEvent.data.object as Stripe.Subscription;
    const metadata = event.metadata;

    if (!metadata) {
      console.log("ℹ️ No metadata found in Stripe event");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (
      metadata.connectAccountPayments ||
      metadata.connectAccountSubscriptions
    ) {
      console.log("⏭️ Skipping event for connected account");

      if (event.metadata?.attendeeId) {
        if (stripeEvent.type === "checkout.session.completed") {
          await changeAttendanceType(
            event.metadata.attendeeId,
            event.metadata.webinarId,
            "CONVERTED"
          );
        }
      }

      return NextResponse.json(
        { message: "Skipping event for connected account" },
        { status: 200 }
      );
    }

    switch (stripeEvent.type) {
      case "checkout.session.completed":
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await updateSubscriptionEvent(event);
        console.log("✅ Subscription event handled:", event.id);
        return NextResponse.json({ received: true }, { status: 200 });
      default:
        console.log(`⚠️ Unhandled event type: ${stripeEvent.type}`);
        return NextResponse.json({ received: true }, { status: 200 });
    }
  } catch (error: any) {
    console.error("❌ Error processing Stripe webhook:", error.message);
    return new Response("Webhook Error: " + error.message, {
      status: 400,
    });
  }
}
