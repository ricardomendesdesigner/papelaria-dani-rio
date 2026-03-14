"use client";

import { useEffect, useState } from "react";
import { Download, Camera } from "lucide-react";
import toast from "react-hot-toast";

interface PhotoRevelationOrder {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  items: string;
  fileNames: string;
  total: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

const statusOptions = [
  { value: "pendente", label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  { value: "em_andamento", label: "Em Andamento", color: "bg-purple-100 text-purple-800" },
  { value: "pronto", label: "Pronto", color: "bg-green-100 text-green-800" },
  { value: "entregue", label: "Entregue", color: "bg-blue-100 text-blue-800" },
];

export default function AdminRevelacaoPage() {
  const [orders, setOrders] = useState<PhotoRevelationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = () => {
    const url =
      filter === "all" ? "/api/photo-revelation" : `/api/photo-revelation?status=${filter}`;
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
    const res = await fetch("/api/photo-revelation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success("Status atualizado!");
      fetchOrders();
    }
  };

  const parseItems = (json: string) => {
    try {
      return JSON.parse(json) as { label?: string; sizeLabel?: string; quantity?: number; subtotal?: number }[];
    } catch {
      return [];
    }
  };

  const parseFileNames = (json: string) => {
    try {
      return JSON.parse(json) as string[];
    } catch {
      return [];
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-gray-800 mb-6 flex items-center gap-2">
        <Camera className="w-7 h-7 text-primary-500" />
        Revelação de Fotos
      </h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {[{ value: "all", label: "Todos" }, ...statusOptions].map((opt) => (
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
          <p className="text-4xl mb-3">📷</p>
          <p>Nenhum pedido de revelação encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = parseItems(order.items);
            const fileNames = parseFileNames(order.fileNames);
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      📷 Revelação #{order.id} — {order.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {order.phone}
                      {order.email ? ` · ${order.email}` : ""} ·{" "}
                      {new Date(order.createdAt).toLocaleString("pt-BR")}
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
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                  {items.map((item, i) => (
                    <span key={i} className="bg-gray-50 rounded-lg px-3 py-1">
                      {item.label ?? `${item.sizeLabel} x${item.quantity}`} — R${" "}
                      {(item.subtotal ?? 0).toFixed(2).replace(".", ",")}
                    </span>
                  ))}
                </div>
                {order.notes && (
                  <p className="text-sm text-gray-500 mb-2">Obs: {order.notes}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {fileNames.map((fn, i) => (
                    <a
                      key={i}
                      href={`/api/uploads/${fn}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Foto {i + 1}
                    </a>
                  ))}
                  <a
                    href={`https://wa.me/55${order.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
