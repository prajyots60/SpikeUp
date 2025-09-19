import { changeAttendanceType } from "@/actions/attendance";
import { updateSubscriptionEvent } from "@/actions/stripe";
import { recordManagedCreatorEarning } from "@/actions/managedStripe";
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
  "payment_intent.succeeded",
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

    // Handle different event types
    switch (stripeEvent.type) {
      case "checkout.session.completed": {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        console.log(
          "[Webhook] checkout.session.completed metadata:",
          session.metadata
        );
        console.log(
          "[Webhook] checkout.session.completed payment_intent:",
          session.payment_intent
        );

        // Handle managed creator earnings
        if (
          session.metadata?.creatorId &&
          session.metadata?.creatorType === "MANAGED_CREATOR"
        ) {
          console.log("💰 Processing managed creator checkout completion");

          // Retrieve payment intent to get full payment details
          if (session.payment_intent) {
            const paymentIntent = await stripe.paymentIntents.retrieve(
              session.payment_intent as string
            );
            console.log("[Webhook] Retrieved paymentIntent:", paymentIntent);
            await recordManagedCreatorEarning(paymentIntent, session);
          } else {
            console.log("[Webhook] No payment_intent found in session!");
          }

          // Mark attendance as converted
          if (session.metadata.attendeeId && session.metadata.webinarId) {
            await changeAttendanceType(
              session.metadata.attendeeId,
              session.metadata.webinarId,
              "CONVERTED"
            );
          }

          return NextResponse.json({ received: true }, { status: 200 });
        }

        // Handle connected account checkouts
        if (
          session.metadata?.connectAccountPayments ||
          session.metadata?.connectAccountSubscriptions
        ) {
          console.log("⏭️ Handling connected account checkout");

          if (session.metadata?.attendeeId && session.metadata?.webinarId) {
            await changeAttendanceType(
              session.metadata.attendeeId,
              session.metadata.webinarId,
              "CONVERTED"
            );
          }

          return NextResponse.json({ received: true }, { status: 200 });
        }

        // Handle platform subscriptions
        if (stripeEvent.type === "checkout.session.completed") {
          const sessionEvent = stripeEvent.data
            .object as Stripe.Checkout.Session;
          // Convert to subscription-like object for backward compatibility
          const event = {
            metadata: sessionEvent.metadata,
            id: sessionEvent.id,
          };
          // Only call updateSubscriptionEvent if this is actually a subscription checkout
          if (sessionEvent.mode === "subscription") {
            await updateSubscriptionEvent(event as any);
          }
        }
        console.log("✅ Platform subscription checkout handled:", session.id);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "payment_intent.succeeded": {
        const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
        console.log(
          "[Webhook] payment_intent.succeeded metadata:",
          paymentIntent.metadata
        );

        // Handle managed creator payment success
        if (paymentIntent.metadata?.creatorId) {
          console.log("💰 Processing managed creator payment success");
          await recordManagedCreatorEarning(paymentIntent);
          return NextResponse.json({ received: true }, { status: 200 });
        }

        console.log(
          "ℹ️ Payment intent succeeded but no managed creator metadata"
        );
        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        const metadata = subscription.metadata;

        if (!metadata) {
          console.log("ℹ️ No metadata found in subscription event");
          return NextResponse.json({ received: true }, { status: 200 });
        }

        if (
          metadata.connectAccountPayments ||
          metadata.connectAccountSubscriptions
        ) {
          console.log("⏭️ Skipping subscription event for connected account");
          return NextResponse.json({ received: true }, { status: 200 });
        }

        await updateSubscriptionEvent(subscription);
        console.log("✅ Platform subscription event handled:", subscription.id);
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

// import { changeAttendanceType } from "@/actions/attendance";
// import { updateSubscriptionEvent } from "@/actions/stripe";
// import { stripe } from "@/lib/stripe/index";
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

// const getStripeEvent = (body: Buffer, sig: string | null): Stripe.Event => {
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
//   if (!sig || !webhookSecret) {
//     throw new Error("Missing Stripe signature or webhook secret");
//   }

//   return stripe.webhooks.constructEvent(body, sig, webhookSecret);
// };

// export async function POST(req: NextRequest) {
//   console.log("📩 Received Stripe webhook event");

//   // ✅ Use arrayBuffer and convert to Buffer
//   const body = Buffer.from(await req.arrayBuffer());
//   const signature = req.headers.get("stripe-signature");

//   try {
//     const stripeEvent = getStripeEvent(body, signature);

//     if (!STRIPE_SUBSCRIPTION_EVENTS.has(stripeEvent.type)) {
//       console.log(`⚠️ Unhandled Stripe event type: ${stripeEvent.type}`);
//       return NextResponse.json({ received: true }, { status: 200 });
//     }

//     const event = stripeEvent.data.object as Stripe.Subscription;
//     const metadata = event.metadata;

//     if (!metadata) {
//       console.log("ℹ️ No metadata found in Stripe event");
//       return NextResponse.json({ received: true }, { status: 200 });
//     }

//     if (
//       metadata.connectAccountPayments ||
//       metadata.connectAccountSubscriptions
//     ) {
//       console.log("⏭️ Skipping event for connected account");

//       if (event.metadata?.attendeeId) {
//         if (stripeEvent.type === "checkout.session.completed") {
//           await changeAttendanceType(
//             event.metadata.attendeeId,
//             event.metadata.webinarId,
//             "CONVERTED"
//           );
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
//         await updateSubscriptionEvent(event);
//         console.log("✅ Subscription event handled:", event.id);
//         return NextResponse.json({ received: true }, { status: 200 });
//       default:
//         console.log(`⚠️ Unhandled event type: ${stripeEvent.type}`);
//         return NextResponse.json({ received: true }, { status: 200 });
//     }
//   } catch (error: any) {
//     console.error("❌ Error processing Stripe webhook:", error.message);
//     return new Response("Webhook Error: " + error.message, {
//       status: 400,
//     });
//   }
// }
