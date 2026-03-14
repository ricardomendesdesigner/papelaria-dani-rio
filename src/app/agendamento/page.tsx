"use client";

import { useState, FormEvent, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { generatePixPayload } from "@/lib/pix";
import { CalendarCheck, User, Phone, Mail, Clock, FileText, Send, ShieldCheck, Baby, QrCode, Copy } from "lucide-react";
import toast from "react-hot-toast";

const AGENDAMENTO_TAXA = 10;

const services = [
  {
    value: "rg_primeira_via",
    label: "RG - 1ª Via",
    price: "Gratuito (taxa do governo)",
    description: "Primeira via da carteira de identidade",
  },
  {
    value: "rg_segunda_via",
    label: "RG - 2ª Via",
    price: "R$ 38,58 (taxa do governo)",
    description: "Segunda via em caso de perda ou roubo",
  },
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export default function AgendamentoPage() {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [guardianCpf, setGuardianCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const minDate = new Date().toISOString().split("T")[0];

  const isMinor = useMemo(() => {
    if (!birthDate) return false;
    const birth = new Date(birthDate + "T12:00:00");
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age < 18;
  }, [birthDate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (cpf.replace(/\D/g, "").length !== 11) {
      toast.error("CPF deve conter 11 dígitos!");
      return;
    }

    if (isMinor && guardianCpf.replace(/\D/g, "").length !== 11) {
      toast.error("CPF do responsável deve conter 11 dígitos!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          cpf: cpf.replace(/\D/g, ""),
          birthDate,
          fatherName,
          motherName,
          guardianCpf: isMinor ? guardianCpf.replace(/\D/g, "") : null,
          phone,
          email,
          date,
          time,
          service,
          notes,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Agendamento realizado com sucesso!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao agendar. Tente novamente.");
      }
    } catch {
      toast.error("Erro ao agendar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const selectedService = services.find((s) => s.value === service);
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <span className="text-7xl mb-6 block">📅</span>
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-3">
            Agendamento Confirmado!
          </h2>
          <div className="card p-6 text-left mb-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Nome:</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CPF:</span>
                <span className="font-medium">{cpf}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Serviço:</span>
                <span className="font-medium">{selectedService?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data:</span>
                <span className="font-medium">
                  {new Date(date + "T12:00:00").toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Horário:</span>
                <span className="font-medium">{time}</span>
              </div>
            </div>
          </div>
          <div className="card p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary-500" />
              Pague agora — R$ 10,00 (PIX)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              O pagamento da taxa de agendamento deve ser feito na hora. Escaneie o QR Code ou copie o código PIX.
            </p>
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-xl border-2 border-primary-200">
                <QRCodeSVG
                  value={generatePixPayload({
                    pixKey: "+5521978836482",
                    merchantName: "Papelaria Dani Rio",
                    merchantCity: "Rio de Janeiro",
                    amount: AGENDAMENTO_TAXA,
                    txId: `AGEND-${date}-${time}`,
                  })}
                  size={180}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between gap-2">
              <span className="text-xs text-gray-500">Chave PIX: 21 97883-6482</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("21978836482");
                  toast.success("Chave copiada!");
                }}
                className="p-1.5 hover:bg-gray-200 rounded-lg"
              >
                <Copy className="w-4 h-4 text-primary-500" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Após o pagamento, envie o comprovante pelo WhatsApp para confirmarmos.
            </p>
          </div>
          <p className="text-gray-500 mb-6 text-sm">
            Você receberá uma confirmação pelo WhatsApp. Por favor, chegue com
            10 minutos de antecedência.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setName("");
              setCpf("");
              setBirthDate("");
              setFatherName("");
              setMotherName("");
              setGuardianCpf("");
              setPhone("");
              setEmail("");
              setDate("");
              setTime("");
              setService("");
              setNotes("");
            }}
            className="btn-primary"
          >
            Novo Agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white">
      <div className="bg-gradient-to-r from-primary-500 via-rose-500 to-orange-400 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-5xl mb-4 block">📋</span>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">
            Agendamento de Identidade
          </h1>
          <p className="text-white/80 text-lg">
            Agende seu RG, fotos e outros serviços
          </p>
          <p className="text-white/90 font-semibold mt-2">
            Taxa de agendamento: R$ 10,00 (pagamento na hora via PIX)
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {services.map((svc) => (
            <button
              key={svc.value}
              onClick={() => setService(svc.value)}
              className={`card p-4 text-left transition-all ${
                service === svc.value
                  ? "ring-2 ring-primary-500 border-primary-500 bg-primary-50"
                  : "hover:border-primary-300"
              }`}
            >
              <h3 className="font-semibold text-gray-800">{svc.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{svc.description}</p>
              <p className="text-sm font-medium text-primary-600 mt-2">
                {svc.price}
              </p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              Dados Pessoais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Nome completo da pessoa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> CPF *
                  </span>
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  required
                  className="input-field"
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <CalendarCheck className="w-3.5 h-3.5" /> Data de Nascimento *
                  </span>
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="input-field"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Pai *
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Nome completo do pai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Mãe *
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Nome completo da mãe"
                />
              </div>
            </div>

            {isMinor && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Baby className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-sm text-yellow-800">
                    Menor de Idade — Dados do Responsável
                  </h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF do Responsável Legal *
                  </label>
                  <input
                    type="text"
                    value={guardianCpf}
                    onChange={(e) => setGuardianCpf(formatCpf(e.target.value))}
                    required
                    className="input-field"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contato */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary-500" />
              Contato
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Telefone (WhatsApp) *
                  </span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="input-field"
                  placeholder="(21) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> E-mail
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
          </div>

          {/* Data e Horário */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary-500" />
              Data e Horário
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data do Agendamento *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={minDate}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serviço *
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="">Selecione o serviço</option>
                  {services.map((svc) => (
                    <option key={svc.value} value={svc.value}>
                      {svc.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Horário Disponível *
              </span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    time === slot
                      ? "bg-primary-500 text-white shadow-lg"
                      : "bg-primary-50 text-gray-600 hover:bg-primary-100"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Resumo e valor */}
          <div className="card p-6 bg-primary-50/50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de agendamento de identidade</p>
                <p className="text-xs text-gray-500 mt-0.5">Pagamento na hora via PIX (após confirmar o agendamento)</p>
              </div>
              <p className="text-2xl font-bold text-primary-600">
                R$ {AGENDAMENTO_TAXA.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>

          {/* Observações */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              Observações
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Informações adicionais..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !service || !time}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Confirmar Agendamento
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
