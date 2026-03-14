"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  CalendarCheck,
  Printer,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";

interface DashboardData {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalAppointments: number;
    totalPrintJobs: number;
    todayOrders: number;
    todayRevenue: number;
    totalRevenue: number;
    pendingOrders: number;
    pendingAppointments: number;
    pendingPrintJobs: number;
  };
  cashRegister: Array<{
    id: number;
    type: string;
    description: string;
    amount: number;
    method: string | null;
    createdAt: string;
  }>;
  recentOrders: Array<{
    id: number;
    customerName: string;
    total: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
  }>;
}

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <p>Erro ao carregar dashboard.</p>;

  const { stats, cashRegister, recentOrders } = data;

  const statCards = [
    {
      label: "Receita Total",
      value: `R$ ${stats.totalRevenue.toFixed(2).replace(".", ",")}`,
      icon: DollarSign,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Vendas Hoje",
      value: stats.todayOrders,
      sub: `R$ ${stats.todayRevenue.toFixed(2).replace(".", ",")}`,
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Pedidos Pendentes",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      label: "Total de Pedidos",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-primary-600 bg-primary-100",
    },
    {
      label: "Produtos Ativos",
      value: stats.totalProducts,
      icon: Package,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Agendamentos Pendentes",
      value: stats.pendingAppointments,
      icon: CalendarCheck,
      color: "text-orange-600 bg-orange-100",
    },
    {
      label: "Impressões Pendentes",
      value: stats.pendingPrintJobs,
      icon: Printer,
      color: "text-cyan-600 bg-cyan-100",
    },
    {
      label: "Total Agendamentos",
      value: stats.totalAppointments,
      icon: AlertCircle,
      color: "text-rose-600 bg-rose-100",
    },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-gray-800 mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            {card.sub && (
              <p className="text-sm text-gray-500 mt-1">{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-display font-semibold text-gray-800">
              Pedidos Recentes
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <p className="p-5 text-sm text-gray-400 text-center">
                Nenhum pedido ainda
              </p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      #{order.id} - {order.customerName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-primary-600">
                      R$ {order.total.toFixed(2).replace(".", ",")}
                    </p>
                    <span
                      className={`badge-${order.status} text-[10px]`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-display font-semibold text-gray-800">
              Movimentações do Caixa
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {cashRegister.length === 0 ? (
              <p className="p-5 text-sm text-gray-400 text-center">
                Nenhuma movimentação
              </p>
            ) : (
              cashRegister.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      {entry.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <span
                    className={`font-semibold text-sm ${
                      entry.type === "saida"
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {entry.type === "saida" ? "-" : "+"}R${" "}
                    {entry.amount.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
