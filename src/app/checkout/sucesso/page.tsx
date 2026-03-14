"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

function SucessoContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const gateway = searchParams.get("gateway");

  const paymentLabel =
    gateway === "pagseguro"
      ? "pago via PagSeguro (cartão, PIX ou boleto)"
      : "pago com sucesso pelo cartão";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-4">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="font-display font-bold text-3xl text-gray-800 mb-3">
          Pagamento Confirmado!
        </h2>
        <p className="text-gray-500 mb-2">
          Pedido <span className="font-bold">#{orderId}</span> {paymentLabel}.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Entraremos em contato pelo WhatsApp com mais informações sobre a retirada.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Voltar ao Início
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5521978836482"}?text=${encodeURIComponent(gateway === "pagseguro" ? `Olá! Acabei de pagar o pedido #${orderId} pelo PagSeguro. Gostaria de confirmar.` : `Olá! Acabei de pagar o pedido #${orderId} pelo cartão. Gostaria de confirmar.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            💬 Confirmar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SucessoContent />
    </Suspense>
  );
}
