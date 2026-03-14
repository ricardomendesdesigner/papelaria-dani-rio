"use client";

import { useState, FormEvent } from "react";
import { Printer, Upload, FileText, Send } from "lucide-react";
import toast from "react-hot-toast";

const prices: Record<string, Record<string, number>> = {
  A4: { pb: 2.5, colorido: 3.0, xerox: 0.5 },
  A3: { pb: 2.5, colorido: 3.0, xerox: 0.5 },
  Carta: { pb: 2.5, colorido: 3.0, xerox: 0.5 },
  Oficio: { pb: 2.5, colorido: 3.0, xerox: 0.5 },
};

export default function ImpressaoPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState("pb");
  const [paperSize, setPaperSize] = useState("A4");
  const [sided, setSided] = useState("frente");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const unitPrice = prices[paperSize]?.[colorMode] || 0.5;
  const sideMultiplier = sided === "frente_verso" ? 0.8 : 1;
  const totalPrice = unitPrice * copies * sideMultiplier;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Selecione um arquivo para impressão!");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("file", file);
      formData.append("copies", copies.toString());
      formData.append("colorMode", colorMode);
      formData.append("paperSize", paperSize);
      formData.append("sided", sided);
      formData.append("notes", notes);
      formData.append("price", totalPrice.toString());

      const res = await fetch("/api/print-jobs", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Pedido de impressão enviado com sucesso!");
      } else {
        toast.error("Erro ao enviar pedido. Tente novamente.");
      }
    } catch {
      toast.error("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <span className="text-7xl mb-6 block">✅</span>
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-3">
            Pedido Enviado!
          </h2>
          <p className="text-gray-500 mb-6">
            Seu pedido de impressão foi recebido. Entraremos em contato pelo
            WhatsApp quando estiver pronto.
          </p>
          <p className="text-lg font-semibold text-primary-600 mb-6">
            Total: R$ {totalPrice.toFixed(2).replace(".", ",")}
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setName("");
              setPhone("");
              setEmail("");
              setFile(null);
              setCopies(1);
              setNotes("");
            }}
            className="btn-primary"
          >
            Nova Impressão
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <div className="bg-gradient-to-r from-blue-500 to-primary-500 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-5xl mb-4 block">🖨️</span>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">
            Impressão de Arquivos
          </h1>
          <p className="text-white/80 text-lg">
            Envie seu arquivo e retire na loja
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              Seus Dados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone (WhatsApp) *
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
                  E-mail
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

          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-500" />
              Arquivo e Configurações
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquivo para Impressão *
              </label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary-300 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx,.xls,.xlsx"
                />
                {file ? (
                  <div className="text-center">
                    <FileText className="w-10 h-10 text-primary-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-10 h-10 text-primary-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Clique para selecionar o arquivo
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, DOC, JPG, PNG, PPT, XLS
                    </p>
                  </div>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamanho do Papel
                </label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="input-field"
                >
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="Carta">Carta</option>
                  <option value="Oficio">Ofício</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modo de Cor
                </label>
                <select
                  value={colorMode}
                  onChange={(e) => setColorMode(e.target.value)}
                  className="input-field"
                >
                  <option value="pb">Preto e Branco</option>
                  <option value="colorido">Colorido</option>
                  <option value="xerox">Xerox</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impressão
                </label>
                <select
                  value={sided}
                  onChange={(e) => setSided(e.target.value)}
                  className="input-field"
                >
                  <option value="frente">Somente Frente</option>
                  <option value="frente_verso">Frente e Verso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cópias
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={copies}
                  onChange={(e) => setCopies(Number(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Instruções adicionais..."
              />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-gray-800 flex items-center gap-2">
                <Printer className="w-5 h-5 text-primary-500" />
                Resumo
              </h2>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Preço por página ({colorMode === "pb" ? "P&B" : colorMode === "colorido" ? "Colorido" : "Xerox"})</span>
                <span>R$ {unitPrice.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between">
                <span>Cópias</span>
                <span>{copies}</span>
              </div>
              {sided === "frente_verso" && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto frente e verso</span>
                  <span>-20%</span>
                </div>
              )}
              <hr className="border-primary-100" />
              <div className="flex justify-between text-lg font-bold text-primary-600">
                <span>Total Estimado</span>
                <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Pedido de Impressão
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
