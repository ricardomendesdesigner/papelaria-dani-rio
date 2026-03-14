import { NextRequest, NextResponse } from "next/server";

const PAGSEGURO_EMAIL = process.env.PAGSEGURO_EMAIL || "";
const PAGSEGURO_TOKEN = process.env.PAGSEGURO_TOKEN || "";
const SANDBOX = process.env.PAGSEGURO_SANDBOX === "true";

const WS_BASE = SANDBOX
  ? "https://ws.sandbox.pagseguro.uol.com.br"
  : "https://ws.pagseguro.uol.com.br";
const PAYMENT_BASE = SANDBOX
  ? "https://sandbox.pagseguro.uol.com.br"
  : "https://pagseguro.uol.com.br";

function buildFormBody(body: Record<string, string>): string {
  return new URLSearchParams(body).toString();
}

export async function POST(request: NextRequest) {
  if (!PAGSEGURO_EMAIL || !PAGSEGURO_TOKEN) {
    return NextResponse.json(
      {
        error:
          "PagSeguro não configurado. Adicione PAGSEGURO_EMAIL e PAGSEGURO_TOKEN no .env",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      shippingPrice = 0,
      redirectSuccess,
    } = body;

    if (!orderId || !customerName || !customerEmail || !items?.length) {
      return NextResponse.json(
        { error: "orderId, customerName, customerEmail e items são obrigatórios" },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const redirectURL =
      redirectSuccess || `${origin}/checkout/sucesso?order_id=${orderId}&gateway=pagseguro`;

    const params: Record<string, string> = {
      email: PAGSEGURO_EMAIL,
      token: PAGSEGURO_TOKEN,
      currency: "BRL",
      reference: String(orderId),
      senderName: customerName.substring(0, 50),
      senderEmail: customerEmail,
      redirectURL,
    };

    const phone = String(customerPhone || "").replace(/\D/g, "");
    if (phone.length >= 10) {
      params.senderAreaCode = phone.slice(0, 2);
      params.senderPhone = phone.slice(2, 11);
    }

    items.forEach((item: { id?: number; name: string; quantity: number; price: number }, i: number) => {
      const idx = i + 1;
      const amount = (item.price * item.quantity).toFixed(2);
      params[`itemId${idx}`] = String(item.id || idx);
      params[`itemDescription${idx}`] = item.name.substring(0, 100);
      params[`itemQuantity${idx}`] = String(item.quantity);
      params[`itemAmount${idx}`] = amount;
    });

    if (shippingPrice > 0) {
      const shippingIdx = items.length + 1;
      params[`itemId${shippingIdx}`] = "frete";
      params[`itemDescription${shippingIdx}`] = "Frete";
      params[`itemQuantity${shippingIdx}`] = "1";
      params[`itemAmount${shippingIdx}`] = shippingPrice.toFixed(2);
    }

    const formBody = buildFormBody(params);

    const res = await fetch(`${WS_BASE}/v2/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: formBody,
    });

    const text = await res.text();

    const codeMatch = text.match(/<code>([^<]+)<\/code>/);
    if (codeMatch) {
      const code = codeMatch[1].trim();
      const paymentUrl = `${PAYMENT_BASE}/v2/checkout/payment.html?code=${code}`;
      return NextResponse.json({ url: paymentUrl, code });
    }

    const errMatch = text.match(/<message>([^<]+)<\/message>/);
    const errMsg = errMatch ? errMatch[1].trim() : "Resposta inválida do PagSeguro";
    console.error("PagSeguro checkout error:", text);
    return NextResponse.json(
      { error: errMsg || "Erro ao criar checkout PagSeguro" },
      { status: 502 }
    );
  } catch (e) {
    console.error("PagSeguro checkout exception:", e);
    return NextResponse.json(
      { error: "Erro ao processar pagamento com PagSeguro" },
      { status: 500 }
    );
  }
}
