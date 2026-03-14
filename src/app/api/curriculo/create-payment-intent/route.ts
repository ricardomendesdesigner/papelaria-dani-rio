import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe não configurado. Adicione STRIPE_SECRET_KEY no .env" },
        { status: 503 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // R$ 10,00 em centavos
      currency: "brl",
      automatic_payment_methods: { enabled: true },
      metadata: { type: "curriculo" },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Erro ao preparar pagamento" },
      { status: 500 }
    );
  }
}
