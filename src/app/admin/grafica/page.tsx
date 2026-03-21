"use client";

import Link from "next/link";
import { Palette, ExternalLink, Package, Store } from "lucide-react";

export default function AdminGraficaPage() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-gray-800 mb-2">
        Gráfica
      </h1>
      <p className="text-gray-500 mb-8">
        Gerencie os produtos da vitrine de gráfica (cartões, banners, adesivos e
        materiais personalizados).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        <Link
          href="/grafica"
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:border-teal-200 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-teal-100 text-teal-600">
              <Store className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-semibold text-gray-800 flex items-center gap-2">
                Ver página da loja
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-teal-500" />
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Abre o catálogo público em{" "}
                <span className="font-mono text-xs">/grafica</span> como o cliente vê.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/produtos?category=grafica"
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:border-primary-200 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary-100 text-primary-600">
              <Package className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-semibold text-gray-800 flex items-center gap-2">
                Produtos da Gráfica
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Lista e edite apenas produtos com categoria Gráfica no painel.
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8 p-4 rounded-xl bg-teal-50 border border-teal-100 text-sm text-teal-900">
        <p className="font-medium flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Dica
        </p>
        <p className="mt-1 text-teal-800/90">
          Ao cadastrar um produto novo, escolha a categoria <strong>Gráfica</strong> para
          que ele apareça na página da loja.
        </p>
      </div>
    </div>
  );
}
