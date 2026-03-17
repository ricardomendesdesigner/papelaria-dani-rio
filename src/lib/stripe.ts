import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/** Lazy-initialized Stripe client so build can succeed when STRIPE_SECRET_KEY is not set. */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return stripeInstance;
}
