"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ImageIcon } from "lucide-react";

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <span className="text-7xl mb-6 block">🛒</span>
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-3">
            Carrinho Vazio
          </h2>
          <p className="text-gray-500 mb-6">
            Você ainda não adicionou nenhum produto ao carrinho.
          </p>
          <Link href="/papelaria" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Ver Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800">
            🛒 Carrinho ({totalItems} {totalItems === 1 ? "item" : "itens"})
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Limpar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card p-4 flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  {item.image && item.image.startsWith("/") ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-primary-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    R$ {item.price.toFixed(2).replace(".", ",")} cada
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      item.quantity <= 1
                        ? removeItem(item.id)
                        : updateQuantity(item.id, item.quantity - 1)
                    }
                    className="p-1.5 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-600 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-semibold w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="font-bold text-primary-600">
                    R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-28">
              <h2 className="font-display font-semibold text-lg text-gray-800 mb-4">
                Resumo do Pedido
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} itens)</span>
                  <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                </div>
                <hr className="border-primary-100" />
                <div className="flex justify-between text-lg font-bold text-primary-600">
                  <span>Total</span>
                  <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                Finalizar Compra
              </Link>
              <Link
                href="/papelaria"
                className="btn-secondary w-full mt-3 flex items-center justify-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
