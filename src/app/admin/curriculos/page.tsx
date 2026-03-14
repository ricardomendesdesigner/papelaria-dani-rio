"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

interface Resume {
  id: number;
  fullName: string;
  birthDate: string;
  maritalStatus: string;
  nationality: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  cnh: string | null;
  objective: string;
  educationLevel: string;
  course: string | null;
  institution: string | null;
  conclusionYear: string | null;
  experiences: string;
  skills: string;
  status: string;
  paymentMethod: string;
  price: number;
  createdAt: string;
}

interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

const statusOptions = [
  { value: "pendente", label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  { value: "pago", label: "Pago", color: "bg-green-100 text-green-800" },
  { value: "pronto", label: "Pronto", color: "bg-blue-100 text-blue-800" },
  { value: "entregue", label: "Entregue", color: "bg-purple-100 text-purple-800" },
];

export default function AdminCurriculosPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchResumes = () => {
    const url = filter === "all" ? "/api/resumes" : `/api/resumes?status=${filter}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setResumes(d);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchResumes();
  }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch("/api/resumes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success("Status atualizado!");
      fetchResumes();
    }
  };

  const parseExperiences = (json: string): Experience[] => {
    try { return JSON.parse(json); } catch { return []; }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-gray-800 mb-6">
        Currículos
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
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📄</p>
          <p>Nenhum currículo encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.map((r) => {
            const exps = parseExperiences(r.experiences);
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800">
                        📄 #{r.id} — {r.fullName}
                      </h3>
                      <span className="text-sm font-bold text-primary-600">
                        R$ {r.price.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {r.phone} · {r.email} · {new Date(r.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer ${
                        statusOptions.find((s) => s.value === r.status)?.color
                      }`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    >
                      {expandedId === r.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedId === r.id && (
                  <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-400 text-xs uppercase font-semibold">Nome</span>
                        <p className="text-gray-800 font-medium">{r.fullName}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase font-semibold">Nascimento</span>
                        <p className="text-gray-800">
                          {new Date(r.birthDate + "T12:00:00").toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase font-semibold">Estado Civil</span>
                        <p className="text-gray-800">{r.maritalStatus}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase font-semibold">Endereço</span>
                        <p className="text-gray-800">{r.address}, {r.city}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase font-semibold">Telefone</span>
                        <p>
                          <a
                            href={`https://wa.me/55${r.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            📱 {r.phone}
                          </a>
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase font-semibold">E-mail</span>
                        <p className="text-gray-800">{r.email}</p>
                      </div>
                      {r.cnh && (
                        <div>
                          <span className="text-gray-400 text-xs uppercase font-semibold">CNH</span>
                          <p className="text-gray-800">{r.cnh}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400 text-xs uppercase font-semibold">Pagamento</span>
                        <p className="text-gray-800 uppercase">{r.paymentMethod}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-gray-400 text-xs uppercase font-semibold">Objetivo</span>
                      <p className="text-gray-700 text-sm mt-1">{r.objective}</p>
                    </div>

                    <div className="mb-4">
                      <span className="text-gray-400 text-xs uppercase font-semibold">Formação</span>
                      <p className="text-gray-800 text-sm font-medium mt-1">{r.educationLevel}</p>
                      {r.course && (
                        <p className="text-gray-700 text-sm">
                          {r.course} {r.institution ? `– ${r.institution}` : ""}{" "}
                          {r.conclusionYear ? `(${r.conclusionYear})` : ""}
                        </p>
                      )}
                    </div>

                    {exps.length > 0 && (
                      <div className="mb-4">
                        <span className="text-gray-400 text-xs uppercase font-semibold">Experiências</span>
                        <div className="mt-2 space-y-2">
                          {exps.map((exp, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                              <p className="font-semibold text-gray-800">{exp.company}</p>
                              <p className="text-gray-600">{exp.role}</p>
                              <p className="text-gray-400 text-xs">
                                {exp.startDate} à {exp.current ? "data atual" : exp.endDate}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {r.skills && (
                      <div>
                        <span className="text-gray-400 text-xs uppercase font-semibold">Perfil</span>
                        <p className="text-gray-700 text-sm mt-1">{r.skills}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
