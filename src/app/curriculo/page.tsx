"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  Send,
  QrCode,
  Copy,
  Car,
  CreditCard,
  FileText,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import { generatePixPayload } from "@/lib/pix";

interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

const maritalOptions = [
  "Solteiro(a)",
  "Casado(a)",
  "Divorciado(a)",
  "Viúvo(a)",
  "União Estável",
];

const educationLevels = [
  "Ensino Fundamental - Incompleto",
  "Ensino Fundamental - Completo",
  "Ensino Médio - Incompleto",
  "Ensino Médio - Completo",
  "Ensino Superior - Incompleto",
  "Ensino Superior - Completo",
  "Pós-Graduação - Incompleto",
  "Pós-Graduação - Completo",
  "Mestrado",
  "Doutorado",
];

const cnhOptions = ["Não possuo", "A", "B", "A/B", "C", "D", "E", "A/C", "A/D", "A/E"];

function CurriculoPageContent() {
  const [paymentDone, setPaymentDone] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resumeId, setResumeId] = useState<number | null>(null);

  // Dados Pessoais
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [nationality, setNationality] = useState("Brasileira");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cnh, setCnh] = useState("Não possuo");

  // Objetivo (fixo)
  const objective = "Fazer parte do quadro de funcionários dessa Empresa, onde eu possa atuar de forma produtiva, contribuindo para o desenvolvimento da Organização e para o crescimento profissional.";

  // Formação
  const [educationLevel, setEducationLevel] = useState("");
  const [course, setCourse] = useState("");
  const [institution, setInstitution] = useState("");
  const [conclusionYear, setConclusionYear] = useState("");

  // Experiências
  const [experiences, setExperiences] = useState<Experience[]>([
    { company: "", role: "", startDate: "", endDate: "", current: false },
  ]);

  // Perfil (fixo)
  const skills = "Responsável, Pontual, Organizado(a), Disponibilidade de Horário, Trabalho em Equipe";

  // Pagamento e comprovante
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  const [comprovantePath, setComprovantePath] = useState<string | null>(null);
  const [uploadingComprovante, setUploadingComprovante] = useState(false);
  // PagSeguro (botão de pagamento online)
  const [pagSeguroName, setPagSeguroName] = useState("");
  const [pagSeguroEmail, setPagSeguroEmail] = useState("");
  const [pagSeguroPhone, setPagSeguroPhone] = useState("");
  const [loadingPagSeguro, setLoadingPagSeguro] = useState(false);
  // Cartão (redirecionamento para Stripe Checkout, igual ao checkout)
  const [loadingCartaoRedirect, setLoadingCartaoRedirect] = useState(false);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("pagamento") === "ok") {
      setPaymentDone(true);
      setPaymentMethod("pagseguro");
      window.history.replaceState({}, "", "/curriculo");
    }
  }, [searchParams]);

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { company: "", role: "", startDate: "", endDate: "", current: false },
    ]);
  };

  const removeExperience = (index: number) => {
    if (experiences.length <= 1) return;
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string | boolean) => {
    const updated = [...experiences];
    (updated[index] as unknown as Record<string, string | boolean>)[field] = value;
    if (field === "current" && value === true) {
      updated[index].endDate = "";
    }
    setExperiences(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          birthDate,
          maritalStatus,
          nationality,
          address,
          city,
          phone,
          email,
          cnh: cnh === "Não possuo" ? null : cnh,
          objective,
          educationLevel,
          course,
          institution,
          conclusionYear,
          experiences: JSON.stringify(experiences.filter((e) => e.company)),
          skills,
          paymentMethod,
          comprovantePath: comprovantePath || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResumeId(data.id);
        setSuccess(true);
        toast.success("Currículo enviado com sucesso!");
      } else {
        toast.error("Erro ao enviar currículo. Tente novamente.");
      }
    } catch {
      toast.error("Erro ao enviar currículo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const validExperiences = experiences.filter((e) => e.company);

  // ==================== SUCCESS ====================
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-4">
          <span className="text-7xl mb-6 block">📄</span>
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-3">
            Currículo Enviado!
          </h2>
          <p className="text-gray-500 mb-2">
            Pedido <span className="font-bold">#{resumeId}</span> — Valor:{" "}
            <span className="font-bold text-primary-600">R$ 10,00</span>
          </p>

          {paymentMethod === "pix" && (
            <div className="card p-6 my-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary-500" />
                Pague via PIX
              </h3>
              <div className="bg-primary-50 p-4 rounded-xl mb-3">
                <p className="text-xs text-gray-500 mb-1">Chave PIX (CNPJ):</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-primary-700">
                    12.345.678/0001-90
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("12345678000190");
                      toast.success("Chave copiada!");
                    }}
                    className="p-1.5 hover:bg-primary-100 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-primary-500" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Após o pagamento, envie o comprovante pelo WhatsApp para receber seu currículo formatado.
              </p>
            </div>
          )}

          {paymentMethod === "cartao" && (
            <div className="card p-6 my-6">
              <p className="text-sm text-gray-500">
                Pagamento de <span className="font-bold">R$ 10,00</span> com cartão de crédito/débito realizado com sucesso.
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            Após efetuar o pagamento, envie o comprovante pelo WhatsApp. Você receberá seu currículo formatado em seguida.
          </p>

          <div className="flex justify-center">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5521978836482"}?text=${encodeURIComponent(`Olá! Fiz o pedido de currículo #${resumeId}. Nome: ${fullName}. Segue comprovante ou informo que pagarei na retirada.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center gap-2"
            >
              💬 Enviar comprovante no WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ==================== PAGAMENTO PRIMEIRO (estilo checkout) ====================
  if (!paymentDone) {
    const pixKey = process.env.NEXT_PUBLIC_PIX_KEY || "21978836482";
    const curriculoPaymentMethods = [
      { id: "pix", label: "PIX", icon: QrCode, description: "Pagamento instantâneo" },
      { id: "cartao", label: "Cartão", icon: CreditCard, description: "Crédito ou Débito" },
    ];

    const handleContinue = async () => {
      if (paymentMethod === "pix") {
        if (!comprovanteFile) return;
        setUploadingComprovante(true);
        try {
          const formData = new FormData();
          formData.append("file", comprovanteFile);
          const res = await fetch("/api/curriculo/comprovante", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            toast.error(data.error || "Erro ao enviar comprovante.");
            return;
          }
          const data = await res.json();
          setComprovantePath(data.path);
          setPaymentDone(true);
          toast.success("Comprovante recebido. Preencha seu currículo.");
        } catch {
          toast.error("Erro ao enviar comprovante. Tente novamente.");
        } finally {
          setUploadingComprovante(false);
        }
      }
      if (paymentMethod === "cartao") {
        setLoadingCartaoRedirect(true);
        try {
          const res = await fetch("/api/curriculo/stripe-checkout", { method: "POST" });
          const data = await res.json();
          if (data.url) {
            window.location.href = data.url;
            return;
          }
          toast.error(data.error || "Erro ao redirecionar para pagamento.");
        } catch {
          toast.error("Erro ao redirecionar para pagamento.");
        } finally {
          setLoadingCartaoRedirect(false);
        }
      }
    };

    const canContinue =
      paymentMethod === "pix"
        ? !!comprovanteFile && !uploadingComprovante
        : false;

    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 mb-8">
            📄 Currículo Online — Pagamento
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-500" />
                  Forma de Pagamento
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {curriculoPaymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === method.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-primary-300"
                      }`}
                    >
                      <method.icon
                        className={`w-8 h-8 mb-2 ${
                          paymentMethod === method.id ? "text-primary-500" : "text-gray-400"
                        }`}
                      />
                      <p className="font-semibold text-sm text-gray-800">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === "pix" && (
                <div className="card p-6">
                  <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary-500" />
                    PIX — Envie o comprovante
                  </h2>
                  {(() => {
                    const pixKeyDigits = pixKey.replace(/\D/g, "");
                    const pixKeyForPayload = pixKeyDigits.length === 11 ? `55${pixKeyDigits}` : pixKeyDigits.startsWith("55") ? pixKeyDigits : `55${pixKeyDigits}`;
                    const pixPayload = generatePixPayload({
                      pixKey: pixKeyForPayload,
                      merchantName: "Papelaria Dani Rio",
                      merchantCity: "Rio de Janeiro",
                      amount: 10,
                      txId: "CURRICULO",
                    });
                    return (
                      <>
                        <p className="text-sm font-semibold text-gray-800 mb-2">Escaneie o QR Code para pagar R$ 10,00:</p>
                        <div className="flex justify-center mb-4">
                          <div className="bg-white p-4 rounded-xl border-2 border-primary-200 shadow-sm">
                            <QRCodeSVG
                              value={pixPayload}
                              size={220}
                              level="M"
                              bgColor="#ffffff"
                              fgColor="#000000"
                            />
                          </div>
                        </div>
                        <p className="text-center text-sm text-gray-500 mb-4">
                          Ou copie a chave PIX abaixo:
                        </p>
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <p className="text-sm font-semibold text-gray-800 mb-2">Chave PIX (Celular):</p>
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-sm font-mono font-bold text-primary-600 break-all">
                              {pixKey}
                            </code>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(pixKeyDigits);
                                toast.success("Chave copiada!");
                              }}
                              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Copy className="w-4 h-4 text-primary-500" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Após efetuar o PIX, envie o comprovante abaixo para liberarmos o formulário.
                          </p>
                        </div>
                      </>
                    );
                  })()}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comprovante de pagamento (obrigatório para PIX)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Imagem (JPG, PNG) ou PDF.
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setComprovanteFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {comprovanteFile && (
                    <p className="text-sm text-primary-600 mt-2 font-medium">
                      ✓ {comprovanteFile.name}
                    </p>
                  )}
                </div>
              )}

              {paymentMethod === "cartao" && (
                <div className="card p-6 my-6">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary-500" />
                    Pagamento com Cartão
                  </h3>
                  <p className="text-sm text-gray-500">
                    Você será redirecionado para a página segura para
                    efetuar o pagamento com cartão.
                  </p>
                </div>
              )}

            </div>

            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-28">
                <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" />
                  Resumo
                </h2>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Currículo formatado</span>
                    <span>R$ 10,00</span>
                  </div>
                </div>
                <hr className="border-primary-100 mb-4" />
                <div className="flex justify-between text-lg font-bold text-primary-600 mb-6">
                  <span>Total</span>
                  <span>R$ 10,00</span>
                </div>
                {paymentMethod === "cartao" ? (
                  <button
                    type="button"
                    disabled={loadingCartaoRedirect}
                    onClick={handleContinue}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingCartaoRedirect ? (
                      <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pagar com cartão
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canContinue}
                    onClick={handleContinue}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingComprovante ? (
                      <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Enviar comprovante e continuar
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== FORM (após pagamento) ====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      <div className="bg-gradient-to-r from-emerald-500 to-primary-500 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-5xl mb-4 block">📄</span>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">
            Currículo Online
          </h1>
          <p className="text-white/80 text-lg">
            Preencha seus dados para receber seu currículo profissional
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex items-center justify-between mb-8 max-w-3xl">
          {[
            { num: 1, label: "Dados Pessoais" },
            { num: 2, label: "Formação" },
            { num: 3, label: "Experiência" },
            { num: 4, label: "Enviar" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  step === s.num
                    ? "bg-primary-500 text-white shadow-lg"
                    : step > s.num
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white/20">
                  {step > s.num ? "✓" : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < 3 && (
                <div
                  className={`h-0.5 w-4 sm:w-8 mx-1 ${
                    step > s.num ? "bg-primary-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
        <form onSubmit={handleSubmit} className="min-w-0 max-w-3xl order-1">
          {/* STEP 1: Dados Pessoais */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
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
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="input-field"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado Civil *
                    </label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      required
                      className="input-field"
                    >
                      <option value="">Selecione</option>
                      {maritalOptions.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nacionalidade *
                    </label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" /> CNH
                      </span>
                    </label>
                    <select
                      value={cnh}
                      onChange={(e) => setCnh(e.target.value)}
                      className="input-field"
                    >
                      {cnhOptions.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  Endereço e Contato
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço Completo *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="input-field"
                      placeholder="Rua, número, bairro, CEP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade / Estado *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="input-field"
                      placeholder="Rio de Janeiro - RJ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> Telefone *
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> E-mail *
                      </span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input-field"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!fullName || !birthDate || !maritalStatus || !address || !city || !phone || !email) {
                      toast.error("Preencha todos os campos obrigatórios!");
                      return;
                    }
                    setStep(2);
                  }}
                  className="btn-primary"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Formação e Objetivo */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary-500" />
                  Formação Acadêmica
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nível de Escolaridade *
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      required
                      className="input-field"
                    >
                      <option value="">Selecione</option>
                      {educationLevels.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Curso
                    </label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="input-field"
                      placeholder="Ex: Gestão de Recursos Humanos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instituição
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="input-field"
                      placeholder="Ex: Universidade Estácio de Sá"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ano de Conclusão
                    </label>
                    <input
                      type="text"
                      value={conclusionYear}
                      onChange={(e) => setConclusionYear(e.target.value)}
                      className="input-field"
                      placeholder="Ex: 2025"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                  ← Voltar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!educationLevel) {
                      toast.error("Preencha o nível de escolaridade!");
                      return;
                    }
                    setStep(3);
                  }}
                  className="btn-primary"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Experiência */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-lg text-gray-800 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary-500" />
                    Experiência Profissional
                  </h2>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>

                <div className="space-y-6">
                  {experiences.map((exp, i) => (
                    <div
                      key={i}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative"
                    >
                      {experiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExperience(i)}
                          className="absolute top-3 right-3 p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <p className="text-xs font-semibold text-primary-500 mb-3">
                        Experiência {i + 1}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Empresa
                          </label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(i, "company", e.target.value)}
                            className="input-field !py-2 text-sm"
                            placeholder="Nome da empresa"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cargo
                          </label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => updateExperience(i, "role", e.target.value)}
                            className="input-field !py-2 text-sm"
                            placeholder="Ex: Caixa/Vendedora"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Início (mês/ano)
                          </label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(i, "startDate", e.target.value)}
                            className="input-field !py-2 text-sm"
                            placeholder="Ex: Março/2023"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Término
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={exp.current ? "" : exp.endDate}
                              onChange={(e) => updateExperience(i, "endDate", e.target.value)}
                              disabled={exp.current}
                              className="input-field !py-2 text-sm disabled:opacity-50"
                              placeholder="Ex: Junho/2024"
                            />
                            <label className="flex items-center gap-1.5 text-xs text-gray-600 whitespace-nowrap cursor-pointer">
                              <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) => updateExperience(i, "current", e.target.checked)}
                                className="rounded border-primary-300 text-primary-500 focus:ring-primary-500"
                              />
                              Atual
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                  ← Voltar
                </button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary">
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Revisar e Enviar */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">
                  ✅ Revisar e Enviar
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Pagamento já confirmado. Revise os dados e envie seu currículo.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-sm text-gray-800 mb-2">Resumo do Currículo:</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="text-gray-400">Nome:</span> {fullName}</p>
                    <p><span className="text-gray-400">Escolaridade:</span> {educationLevel}</p>
                    <p><span className="text-gray-400">Experiências:</span> {validExperiences.length}</p>
                    <p><span className="text-gray-400">Telefone:</span> {phone}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(3)} className="btn-secondary">
                  ← Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                    {loading ? (
                      <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Enviar Currículo — R$ 10,00
                      </>
                    )}
                  </button>
              </div>
            </div>
          )}
        </form>

        {/* Modelo do currículo - ao lado (desktop) ou abaixo (mobile) */}
        <aside className="lg:sticky lg:top-8 order-2 lg:order-none">
          <div className="card p-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">Modelo do currículo</p>
            <p className="text-xs text-gray-500 mb-3">Pré-visualização com seus dados</p>
            <div className="overflow-auto max-h-[320px] lg:max-h-[calc(100vh-12rem)] rounded-lg border border-gray-200 bg-white flex items-start justify-center p-2">
              <div className="scale-90 origin-top">
                <ResumePreviewContent
                fullName={fullName || "Seu Nome"}
                birthDate={birthDate}
                maritalStatus={maritalStatus || "—"}
                nationality={nationality}
                address={address || "—"}
                city={city || "—"}
                phone={phone || "—"}
                email={email || "—"}
                cnh={cnh}
                objective={objective}
                educationLevel={educationLevel || "—"}
                course={course}
                institution={institution}
                conclusionYear={conclusionYear}
                experiences={experiences}
                skills={skills}
                previewMode
              />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ==================== Resume Preview Content ====================
function ResumePreviewContent({
  fullName, birthDate, maritalStatus, nationality, address, city,
  phone, email, cnh, objective, educationLevel, course, institution,
  conclusionYear, experiences, skills,
  previewMode = false,
}: {
  fullName: string; birthDate: string; maritalStatus: string;
  nationality: string; address: string; city: string; phone: string;
  email: string; cnh: string; objective: string; educationLevel: string;
  course: string; institution: string; conclusionYear: string;
  experiences: Experience[]; skills: string;
  previewMode?: boolean;
}) {
  const formattedBirth = birthDate
    ? new Date(birthDate + "T12:00:00").toLocaleDateString("pt-BR")
    : "";

  if (previewMode) {
    const fs = "14px";
    const fsTitle = "15px";
    return (
      <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: fs, color: "#1a1a1a", lineHeight: 1.5, position: "relative", border: "1px solid #000", width: "100%", minHeight: "320px", overflow: "hidden", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", inset: "2px", border: "1px solid #000", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: "5px", border: "1px solid #000", pointerEvents: "none", zIndex: 1 }} />
        <div style={{ position: "relative", zIndex: 2, padding: "14px 16px" }}>
          <div style={{ marginBottom: "6px" }}>
            <h1 style={{ fontSize: fsTitle, fontWeight: "bold", marginBottom: "3px" }}>{fullName}</h1>
            <p style={{ fontSize: fs, color: "#333" }}>{formattedBirth}</p>
            <p style={{ fontSize: fs, color: "#333" }}>{maritalStatus}, {nationality}, {city}</p>
          </div>
          <div style={{ fontSize: fs, color: "#333", marginBottom: "6px" }}>
            <p>{address}</p>
            <p>{phone}</p>
            <p>{email}</p>
            {cnh && cnh !== "Não possuo" && <p>CNH: ({cnh})</p>}
          </div>
          <hr style={{ border: "none", borderTop: "1px solid #222", margin: "8px 0" }} />
          <div style={{ marginBottom: "10px" }}>
            <p style={{ fontSize: fs, fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px", borderBottom: "1px solid #999", paddingBottom: "2px" }}>Objetivo Profissional</p>
            <p style={{ fontSize: fs, color: "#333" }}>{objective}</p>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <p style={{ fontSize: fs, fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px", borderBottom: "1px solid #999", paddingBottom: "2px" }}>Formação Acadêmica</p>
            <p style={{ fontSize: fs, color: "#333" }}>{educationLevel}</p>
            {course && <p style={{ fontSize: fs, fontWeight: "bold", color: "#333" }}>{course} {institution ? `– ${institution.toUpperCase()}` : ""}</p>}
            {conclusionYear && <p style={{ fontSize: fs, color: "#555" }}>Conclusão: {conclusionYear}</p>}
          </div>
          {experiences.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <p style={{ fontSize: fs, fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px", borderBottom: "1px solid #999", paddingBottom: "2px" }}>Experiência Profissional</p>
              {experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: "6px" }}>
                  <p style={{ fontSize: fs, fontWeight: "bold" }}>{exp.company.toUpperCase()} – <span style={{ fontWeight: "normal", color: "#555" }}>{exp.startDate} à {exp.current ? "data atual" : exp.endDate}</span></p>
                  <p style={{ fontSize: fs, color: "#555" }}>{exp.role}</p>
                </div>
              ))}
            </div>
          )}
          {skills && (
            <div>
              <p style={{ fontSize: fs, fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px", borderBottom: "1px solid #999", paddingBottom: "2px" }}>Perfil Profissional</p>
              <ul style={{ fontSize: fs, color: "#333", paddingLeft: "18px", margin: 0, listStyleType: "disc" }}>
                {skills.split(/[,]|\se\s/).filter(s => s.trim()).map((skill, i) => (
                  <li key={i} style={{ marginBottom: "3px" }}>{skill.trim()}</li>
                ))}
              </ul>
            </div>
          )}
          <div style={{ marginTop: "20px", textAlign: "center", fontSize: fs, color: "#1a1a1a" }}>
            <p>{fullName}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "12pt", color: "#1a1a1a", lineHeight: 1.6, position: "relative", border: "2px solid #000", height: "1060px", maxHeight: "1060px", margin: "20px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: "6px", border: "2px solid #000", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: "14px", border: "2px solid #000", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "relative", zIndex: 2, padding: "36px 45px" }}>
      <div style={{ marginBottom: "6px" }}>
        <h1 style={{ fontSize: "14pt", fontWeight: "bold", marginBottom: "4px" }}>{fullName}</h1>
        <p style={{ fontSize: "12pt", color: "#333" }}>{formattedBirth}</p>
        <p style={{ fontSize: "12pt", color: "#333" }}>{maritalStatus}, {nationality}, {city}</p>
      </div>
      <div style={{ fontSize: "12pt", color: "#333", marginBottom: "6px" }}>
        <p>{address}</p>
        <p>{phone}</p>
        <p>{email}</p>
        {cnh && cnh !== "Não possuo" && <p>CNH: ({cnh})</p>}
      </div>
      <hr style={{ border: "none", borderTop: "2px solid #222", margin: "12px 0" }} />
      <div style={{ marginBottom: "14px" }}>
        <p style={{ fontSize: "12pt", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px", borderBottom: "1px solid #999", paddingBottom: "2px" }}>Objetivo Profissional</p>
        <p style={{ fontSize: "12pt", color: "#333" }}>{objective}</p>
      </div>
      <div style={{ marginBottom: "14px" }}>
        <p style={{ fontSize: "12pt", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px", borderBottom: "1px solid #999", paddingBottom: "2px" }}>Formação Acadêmica</p>
        <p style={{ fontSize: "12pt", color: "#333" }}>{educationLevel}</p>
        {course && <p style={{ fontSize: "12pt", fontWeight: "bold", color: "#333" }}>{course} {institution ? `– ${institution.toUpperCase()}` : ""}</p>}
        {conclusionYear && <p style={{ fontSize: "12pt", color: "#555" }}>Conclusão: {conclusionYear}</p>}
      </div>
      {experiences.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <p style={{ fontSize: "12pt", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px", borderBottom: "1px solid #999", paddingBottom: "2px" }}>Experiência Profissional</p>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <p style={{ fontSize: "12pt", fontWeight: "bold" }}>{exp.company.toUpperCase()} – <span style={{ fontWeight: "normal", color: "#555" }}>{exp.startDate} à {exp.current ? "data atual" : exp.endDate}</span></p>
              <p style={{ fontSize: "12pt", color: "#555" }}>{exp.role}</p>
            </div>
          ))}
        </div>
      )}
      {skills && (
        <div>
          <p style={{ fontSize: "12pt", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px", borderBottom: "1px solid #999", paddingBottom: "2px" }}>Perfil Profissional</p>
          <ul style={{ fontSize: "12pt", color: "#333", paddingLeft: "20px", margin: 0, listStyleType: "disc" }}>
            {skills.split(/[,]|\se\s/).filter(s => s.trim()).map((skill, i) => (
              <li key={i} style={{ marginBottom: "4px" }}>{skill.trim()}</li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ marginTop: "150px", textAlign: "center", fontSize: "12pt", color: "#1a1a1a" }}>
        <p>{fullName}</p>
      </div>
      </div>
    </div>
  );
}

export default function CurriculoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-white flex items-center justify-center">
        <span className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    }>
      <CurriculoPageContent />
    </Suspense>
  );
}
