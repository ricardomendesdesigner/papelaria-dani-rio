"use client";

import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import toast from "react-hot-toast";

interface PrintJob {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  fileName: string;
  copies: number;
  colorMode: string;
  paperSize: string;
  sided: string;
  price: number;
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

export default function AdminImpressoesPage() {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchPrintJobs = () => {
    const url =
      filter === "all" ? "/api/print-jobs" : `/api/print-jobs?status=${filter}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setPrintJobs(d);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPrintJobs();
  }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch("/api/print-jobs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success("Status atualizado!");
      fetchPrintJobs();
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-gray-800 mb-6">
        Impressões
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
      ) : printJobs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🖨️</p>
          <p>Nenhuma impressão encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {printJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    🖨️ Impressão #{job.id} — {job.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {job.phone} · {new Date(job.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary-600">
                    R$ {job.price.toFixed(2).replace(".", ",")}
                  </span>
                  <select
                    value={job.status}
                    onChange={(e) => updateStatus(job.id, e.target.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer ${
                      statusOptions.find((s) => s.value === job.status)?.color
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
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="bg-gray-50 rounded-lg px-3 py-1">
                  📄 {job.fileName.split("-").slice(1).join("-") || job.fileName}
                </span>
                <span className="bg-gray-50 rounded-lg px-3 py-1">
                  {job.copies} {job.copies === 1 ? "cópia" : "cópias"}
                </span>
                <span className="bg-gray-50 rounded-lg px-3 py-1">
                  {job.colorMode === "pb" ? "P&B" : job.colorMode === "colorido" ? "Colorido" : "Xerox"}
                </span>
                <span className="bg-gray-50 rounded-lg px-3 py-1">
                  {job.paperSize}
                </span>
                <span className="bg-gray-50 rounded-lg px-3 py-1">
                  {job.sided === "frente_verso" ? "Frente e Verso" : "Somente Frente"}
                </span>
              </div>
              {job.notes && (
                <p className="text-sm text-gray-400 mt-2">Obs: {job.notes}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <a
                  href={`/api/uploads/${job.fileName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Baixar Arquivo
                </a>
                <button
                  onClick={() => {
                    const url = `/api/uploads/${job.fileName}`;
                    const win = window.open(url, "_blank");
                    if (win) {
                      win.addEventListener("load", () => {
                        setTimeout(() => win.print(), 500);
                      });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
                <a
                  href={`https://wa.me/55${job.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  💬 Avisar pelo WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
