"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{
    id: number;
    quantity: number;
    unitPrice: number;
    product: { name: string; image: string };
  }>;
}

const statusOptions = [
  { value: "pendente", label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  { value: "pago", label: "Pago", color: "bg-green-100 text-green-800" },
  { value: "concluido", label: "Concluído", color: "bg-blue-100 text-blue-800" },
  { value: "cancelado", label: "Cancelado", color: "bg-red-100 text-red-800" },
];

export default function AdminVendasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = () => {
    const url = filter === "all" ? "/api/orders" : `/api/orders?status=${filter}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setOrders(d);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success("Status atualizado!");
      fetchOrders();
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-gray-800 mb-6">
        Vendas
      </h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {[{ value: "all", label: "Todas" }, ...statusOptions].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === opt.value
                ? "bg-primary-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Pedido #{order.id} — {order.customerName}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {order.customerPhone} · {new Date(order.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary-600">
                    R$ {order.total.toFixed(2).replace(".", ",")}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer ${
                      statusOptions.find((s) => s.value === order.status)?.color
                    }`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 text-sm"
                  >
                    <span>{item.product.image}</span>
                    <span className="text-gray-700">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="text-gray-400">
                      R$ {(item.unitPrice * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Pagamento: {order.paymentMethod.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
