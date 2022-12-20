import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import { fetchAdmin } from "./utils";
import {
  draftOrderCreate,
  draftCreateVariables,
  draftOrderComplete,
} from "./queries";
dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

const stripe = new Stripe(stripeSecret as string, {
  apiVersion: "2022-11-15",
  typescript: true,
});

const createDraftOrder = async () => {
  try {
    const input = { draftCreateVariables };
    const res = await fetchAdmin(draftOrderCreate, input);
    console.log("createDraftOrder res", res);
    return res.draftOrderCreate.draftOrder.id;
  } catch (error) {
    console.log("error while creating draft order");
  }
};

const completeDraftOrder = async (id: string) => {
  try {
    const input = {
      id: id,
      sourceName: "Native Test",
    };
    const res = await fetchAdmin(draftOrderComplete, input);
    console.log("createDraftOrder res", res);
    return res.draftOrderComplete.draftOrder.order.id;
  } catch (error) {
    console.log("error while creating draft order");
  }
};

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// payment sheet connecting to expo app
app.post("/payment-sheet", async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2022-11-15" }
  );
  try {
    // const pendingOrderId = await createDraftOrder();
    console.log("connected to app");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1099,
      currency: "usd",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: publishableKey,
    });
  } catch (e: any) {
    switch (e.type) {
      case "StripeCardError":
        console.log(`A payment error occurred: ${e.message}`);
        break;
      case "StripeInvalidRequestError":
        console.log("An invalid request occurred.");
        break;
      default:
        console.log("Another problem occurred, maybe unrelated to Stripe.");
        break;
    }
  }
});

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const endpointSecret = process.env.STRIPE_CLI_SECRET;
    let event = request.body;

    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"] as string;
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
        );
      } catch (err: any) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`
        );
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "charge.succeeded":
        createDraftOrder();
        break;
      // create draft Order and complete it

      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
