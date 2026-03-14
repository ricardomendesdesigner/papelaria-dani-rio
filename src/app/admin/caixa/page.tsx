"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  DollarSign,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  X,
  Ban,
} from "lucide-react";
import toast from "react-hot-toast";

interface CashEntry {
  id: number;
  type: string;
  description: string;
  amount: number;
  method: string | null;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  venda: "Venda",
  impressao: "Impressão",
  servico: "Serviço",
  entrada: "Entrada",
  saida: "Saída",
};

const typeColors: Record<string, string> = {
  venda: "text-green-600",
  impressao: "text-blue-600",
  servico: "text-purple-600",
  entrada: "text-green-600",
  saida: "text-red-600",
};

export default function AdminCaixaPage() {
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [formType, setFormType] = useState("entrada");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formMethod, setFormMethod] = useState("dinheiro");

  const fetchEntries = () => {
    const params = new URLSearchParams();
    if (filterType !== "all") params.set("type", filterType);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    fetch(`/api/admin/cash-register?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.entries);
        setTotal(d.total);
        setCount(d.count);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEntries();
  }, [filterType, startDate, endDate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formDescription || !formAmount) {
      toast.error("Preencha todos os campos!");
      return;
    }

    const amount =
      formType === "saida"
        ? -Math.abs(parseFloat(formAmount))
        : Math.abs(parseFloat(formAmount));

    const res = await fetch("/api/admin/cash-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: formType,
        description: formDescription,
        amount,
        method: formMethod,
      }),
    });

    if (res.ok) {
      toast.success("Registro adicionado!");
      setShowForm(false);
      setFormDescription("");
      setFormAmount("");
      fetchEntries();
    } else {
      toast.error("Erro ao registrar.");
    }
  };

  const handleCancel = async (entry: CashEntry) => {
    if (!confirm(`Cancelar e excluir "${entry.description}" no valor de R$ ${Math.abs(entry.amount).toFixed(2).replace(".", ",")}?`)) return;

    const res = await fetch(`/api/admin/cash-register?id=${entry.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Venda cancelada e excluída!");
      fetchEntries();
    } else {
      toast.error("Erro ao cancelar.");
    }
  };

  const incomeTotal = entries
    .filter((e) => e.amount > 0)
    .reduce((acc, e) => acc + e.amount, 0);
  const expenseTotal = entries
    .filter((e) => e.amount < 0)
    .reduce((acc, e) => acc + Math.abs(e.amount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-800">
          Sistema de Caixa
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 !py-2 !px-4 text-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Movimentação
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Entradas</span>
            <ArrowUpCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            R$ {incomeTotal.toFixed(2).replace(".", ",")}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Saídas</span>
            <ArrowDownCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500">
            R$ {expenseTotal.toFixed(2).replace(".", ",")}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Saldo</span>
            <DollarSign className="w-5 h-5 text-primary-500" />
          </div>
          <p
            className={`text-2xl font-bold ${
              total >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            R$ {total.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-gray-400">{count} movimentações</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Nova Movimentação</h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="input-field"
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
                <option value="venda">Venda Manual</option>
                <option value="servico">Serviço</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método
              </label>
              <select
                value={formMethod}
                onChange={(e) => setFormMethod(e.target.value)}
                className="input-field"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="cartao">Cartão</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="input-field"
                placeholder="Descreva a movimentação"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="input-field"
                placeholder="0,00"
                required
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary">
                Registrar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field !py-2 text-sm"
            >
              <option value="all">Todos os tipos</option>
              <option value="venda">Vendas</option>
              <option value="impressao">Impressões</option>
              <option value="servico">Serviços</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">De</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field !py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Até</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field !py-2 text-sm"
            />
          </div>
          {(filterType !== "all" || startDate || endDate) && (
            <button
              onClick={() => {
                setFilterType("all");
                setStartDate("");
                setEndDate("");
              }}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Descrição
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Método
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Valor
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                      Nenhuma movimentação encontrada
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(entry.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-medium ${
                            typeColors[entry.type] || "text-gray-600"
                          }`}
                        >
                          {typeLabels[entry.type] || entry.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {entry.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 uppercase">
                        {entry.method || "—"}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold text-sm ${
                          entry.amount >= 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {entry.amount >= 0 ? "+" : ""}R${" "}
                        {entry.amount.toFixed(2).replace(".", ",")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {entry.amount > 0 ? (
                          <button
                            onClick={() => handleCancel(entry)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                            title="Cancelar venda"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Cancelar
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
