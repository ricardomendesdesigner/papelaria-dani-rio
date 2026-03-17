import { getStripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe não configurado" },
        { status: 503 }
      );
    }
    const stripe = getStripe();
    const origin = request.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Currículo formatado",
            },
            unit_amount: 1000, // R$ 10,00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/curriculo?pagamento=ok`,
      cancel_url: `${origin}/curriculo?cancelado=true`,
      metadata: {
        type: "curriculo",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout curriculo error:", error);
    return NextResponse.json(
      { error: "Erro ao criar sessão de pagamento" },
      { status: 500 }
    );
  }
}
