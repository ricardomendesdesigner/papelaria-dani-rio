"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingCart, Plus, Minus, ImageIcon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  image,
  category,
  stock,
}: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const cartItem = items.find((i) => i.id === id);

  const handleAdd = () => {
    if (stock <= 0) {
      toast.error("Produto esgotado!");
      return;
    }
    addItem({ id, name, price, image, category });
    toast.success(`${name} adicionado ao carrinho!`, {
      icon: "🛒",
    });
  };

  return (
    <div className="card group">
      <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-primary-50 to-primary-100">
        {image && image.startsWith("/") ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <ImageIcon className="w-16 h-16 text-primary-200" />
          </div>
        )}
        {stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-sm">
              Esgotado
            </span>
          </div>
        )}
        {stock > 0 && stock <= 5 && (
          <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            Restam {stock}!
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-gray-800 mb-1 line-clamp-1">
          {name}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">
            R$ {price.toFixed(2).replace(".", ",")}
          </span>
          {cartItem ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  cartItem.quantity <= 1
                    ? removeItem(id)
                    : updateQuantity(id, cartItem.quantity - 1)
                }
                className="p-1.5 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-600 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-semibold text-sm w-6 text-center">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(id, cartItem.quantity + 1)}
                className="p-1.5 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={stock <= 0}
              className="flex items-center gap-1.5 btn-primary !py-2 !px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              Adicionar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
