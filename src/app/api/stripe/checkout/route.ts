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
    const body = await request.json();
    const { items, customerName, customerPhone, customerEmail, orderId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    const lineItems = items.map(
      (item: { name: string; price: number; quantity: number; image?: string }) => ({
        price_data: {
          currency: "brl",
          product_data: {
            name: item.name,
            ...(item.image && item.image.startsWith("/")
              ? {}
              : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })
    );

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${origin}/checkout?cancelado=true`,
      customer_email: customerEmail || undefined,
      metadata: {
        orderId: String(orderId),
        customerName,
        customerPhone,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Erro ao criar sessão de pagamento" },
      { status: 500 }
    );
  }
}
