"use client";

import { useEffect, useState, useRef } from "react";
import { Printer } from "lucide-react";
import toast from "react-hot-toast";

interface Appointment {
  id: number;
  name: string;
  cpf: string;
  birthDate: string;
  fatherName: string;
  motherName: string;
  guardianCpf: string | null;
  phone: string;
  email: string | null;
  date: string;
  time: string;
  service: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

const serviceLabels: Record<string, string> = {
  rg_primeira_via: "RG - 1ª Via",
  rg_segunda_via: "RG - 2ª Via",
};

const statusOptions = [
  { value: "pendente", label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmado", label: "Confirmado", color: "bg-green-100 text-green-800" },
  { value: "concluido", label: "Concluído", color: "bg-blue-100 text-blue-800" },
  { value: "cancelado", label: "Cancelado", color: "bg-red-100 text-red-800" },
];

function formatCpf(cpf: string) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export default function AdminAgendamentosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const printRef = useRef<HTMLDivElement>(null);

  const fetchAppointments = () => {
    const url =
      filter === "all" ? "/api/appointments" : `/api/appointments?status=${filter}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setAppointments(d);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch("/api/appointments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success("Status atualizado!");
      fetchAppointments();
    }
  };

  const handlePrint = (apt: Appointment) => {
    const win = window.open("", "_blank");
    if (!win) return;

    const birthFormatted = new Date(apt.birthDate + "T12:00:00").toLocaleDateString("pt-BR");
    const dateFormatted = new Date(apt.date).toLocaleDateString("pt-BR");
    const createdFormatted = new Date(apt.createdAt).toLocaleString("pt-BR");

    win.document.write(`
      <html>
        <head>
          <title>Agendamento #${apt.id} - ${apt.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
            h1 { font-size: 20px; text-align: center; margin-bottom: 5px; color: #e91e8c; }
            .subtitle { text-align: center; font-size: 13px; color: #888; margin-bottom: 25px; }
            .section-title { font-size: 14px; font-weight: bold; color: #e91e8c; border-bottom: 2px solid #f0a0c8; padding-bottom: 4px; margin: 18px 0 10px; text-transform: uppercase; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; }
            .field label { font-size: 11px; color: #999; text-transform: uppercase; font-weight: 600; }
            .field p { font-size: 14px; color: #333; font-weight: 500; margin-top: 2px; }
            .full { grid-column: 1 / -1; }
            .badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
            .badge-service { background: #fce4ec; color: #c2185b; }
            .badge-status { background: #fff3cd; color: #856404; }
            .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 11px; color: #aaa; text-align: center; }
            .highlight { color: #e65100; font-weight: 600; }
            @media print { body { padding: 15px; } }
          </style>
        </head>
        <body>
          <h1>Papelaria Dani Rio</h1>
          <p class="subtitle">Ficha de Agendamento de Identidade</p>

          <div style="text-align: center; margin-bottom: 20px;">
            <span class="badge badge-service">${serviceLabels[apt.service] || apt.service}</span>
            &nbsp;
            <span class="badge badge-status">${statusOptions.find(s => s.value === apt.status)?.label || apt.status}</span>
          </div>

          <div class="section-title">Dados Pessoais</div>
          <div class="grid">
            <div class="field">
              <label>Nome Completo</label>
              <p>${apt.name}</p>
            </div>
            <div class="field">
              <label>CPF</label>
              <p>${formatCpf(apt.cpf)}</p>
            </div>
            <div class="field">
              <label>Data de Nascimento</label>
              <p>${birthFormatted}</p>
            </div>
            <div class="field">
              <label>Telefone</label>
              <p>${apt.phone}</p>
            </div>
            ${apt.email ? `<div class="field"><label>E-mail</label><p>${apt.email}</p></div>` : ""}
          </div>

          <div class="section-title">Filiação</div>
          <div class="grid">
            <div class="field">
              <label>Nome do Pai</label>
              <p>${apt.fatherName}</p>
            </div>
            <div class="field">
              <label>Nome da Mãe</label>
              <p>${apt.motherName}</p>
            </div>
            ${apt.guardianCpf ? `
              <div class="field full">
                <label>CPF do Responsável (menor de idade)</label>
                <p class="highlight">${formatCpf(apt.guardianCpf)}</p>
              </div>
            ` : ""}
          </div>

          <div class="section-title">Agendamento</div>
          <div class="grid">
            <div class="field">
              <label>Data</label>
              <p>${dateFormatted}</p>
            </div>
            <div class="field">
              <label>Horário</label>
              <p>${apt.time}</p>
            </div>
            ${apt.notes ? `
              <div class="field full">
                <label>Observações</label>
                <p>${apt.notes}</p>
              </div>
            ` : ""}
          </div>

          <div class="footer">
            Agendamento #${apt.id} · Registrado em ${createdFormatted}
          </div>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-gray-800 mb-6">
        Agendamentos
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
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📅</p>
          <p>Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-800">
                      #{apt.id} — {apt.name}
                    </h3>
                    <span className="badge bg-primary-100 text-primary-700">
                      {serviceLabels[apt.service] || apt.service}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    📅 {new Date(apt.date).toLocaleDateString("pt-BR")} às {apt.time}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={apt.status}
                    onChange={(e) => updateStatus(apt.id, e.target.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer ${
                      statusOptions.find((s) => s.value === apt.status)?.color
                    }`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handlePrint(apt)}
                    className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                    title="Imprimir ficha"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </button>
                </div>
              </div>

              <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs uppercase font-semibold">Nome Completo</span>
                    <p className="text-gray-800 font-medium">{apt.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs uppercase font-semibold">CPF</span>
                    <p className="text-gray-800 font-medium">{formatCpf(apt.cpf)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs uppercase font-semibold">Data de Nascimento</span>
                    <p className="text-gray-800 font-medium">
                      {new Date(apt.birthDate + "T12:00:00").toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs uppercase font-semibold">Nome do Pai</span>
                    <p className="text-gray-800 font-medium">{apt.fatherName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs uppercase font-semibold">Nome da Mãe</span>
                    <p className="text-gray-800 font-medium">{apt.motherName}</p>
                  </div>
                  {apt.guardianCpf && (
                    <div>
                      <span className="text-gray-400 text-xs uppercase font-semibold">
                        CPF do Responsável (menor)
                      </span>
                      <p className="text-orange-600 font-medium">
                        {formatCpf(apt.guardianCpf)}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 text-xs uppercase font-semibold">Telefone</span>
                    <p>
                      <a
                        href={`https://wa.me/55${apt.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        📱 {apt.phone}
                      </a>
                    </p>
                  </div>
                  {apt.email && (
                    <div>
                      <span className="text-gray-400 text-xs uppercase font-semibold">E-mail</span>
                      <p className="text-gray-800">{apt.email}</p>
                    </div>
                  )}
                  {apt.notes && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <span className="text-gray-400 text-xs uppercase font-semibold">Observações</span>
                      <p className="text-gray-600">{apt.notes}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
                  Agendado em: {new Date(apt.createdAt).toLocaleString("pt-BR")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
