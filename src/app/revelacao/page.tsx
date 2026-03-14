"use client";

import { useState, FormEvent } from "react";
import { Camera, Upload, Send, Plus, Trash2, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

const PRICE_TABLE = [
  { id: "10x15", label: "10x15 cm", type: "each" as const, price: 2.5, unitLabel: "cada" },
  {
    id: "3x4",
    label: "3x4 cm",
    type: "package" as const,
    options: [
      { qty: 6, price: 8 },
      { qty: 12, price: 14 },
    ],
    unitLabel: "6 fotos",
  },
  { id: "13x18", label: "13x18 cm", type: "each" as const, price: 4, unitLabel: "cada" },
  { id: "15x20", label: "15x20 cm", type: "each" as const, price: 6, unitLabel: "cada" },
  { id: "20x25", label: "20x25 cm", type: "each" as const, price: 9, unitLabel: "cada" },
];

type CartItem = {
  sizeId: string;
  sizeLabel: string;
  option?: number;
  optionLabel?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export default function RevelacaoPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [addSize, setAddSize] = useState("");
  const [addOption, setAddOption] = useState<number>(6);
  const [addQty, setAddQty] = useState(1);

  const total = cart.reduce((sum, i) => sum + i.subtotal, 0);

  const handleAddItem = () => {
    if (!addSize) {
      toast.error("Selecione o tamanho.");
      return;
    }
    const row = PRICE_TABLE.find((r) => r.id === addSize);
    if (!row) return;

    let unitPrice: number;
    let optionLabel: string | undefined;

    if (row.type === "package" && row.options) {
      const opt = row.options.find((o) => o.qty === addOption);
      unitPrice = opt?.price ?? 8;
      optionLabel = `${addOption} fotos`;
    } else {
      unitPrice = "price" in row ? row.price : 0;
    }

    const qty = Math.max(1, addQty);
    const subtotal = unitPrice * qty;

    setCart((prev) => [
      ...prev,
      {
        sizeId: addSize,
        sizeLabel: row.label,
        option: row.type === "package" ? addOption : undefined,
        optionLabel,
        quantity: qty,
        unitPrice,
        subtotal,
      },
    ]);
    setAddSize("");
    setAddQty(1);
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Preencha nome e telefone.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Adicione pelo menos um tamanho de revelação.");
      return;
    }
    if (files.length === 0) {
      toast.error("Envie pelo menos uma foto.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("phone", phone.trim());
      formData.append("email", email.trim());
      formData.append("notes", notes.trim());
      formData.append(
        "items",
        JSON.stringify(
          cart.map((i) => ({
            size: i.sizeId,
            sizeLabel: i.sizeLabel,
            option: i.option,
            optionLabel: i.optionLabel,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.subtotal,
            label: i.optionLabel ? `${i.sizeLabel} (${i.optionLabel}) x${i.quantity}` : `${i.sizeLabel} x${i.quantity}`,
          }))
        )
      );
      formData.append("total", total.toFixed(2));
      files.forEach((f) => formData.append("files", f));

      const res = await fetch("/api/photo-revelation", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Pedido de revelação enviado com sucesso!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao enviar pedido.");
      }
    } catch {
      toast.error("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <span className="text-7xl mb-6 block">📷</span>
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-3">
            Pedido Enviado!
          </h2>
          <p className="text-gray-500 mb-6">
            Suas fotos para revelação foram recebidas. Entraremos em contato pelo
            WhatsApp quando estiver pronto. Total:{" "}
            <strong className="text-primary-600">
              R$ {total.toFixed(2).replace(".", ",")}
            </strong>
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setName("");
              setPhone("");
              setEmail("");
              setNotes("");
              setFiles([]);
              setCart([]);
            }}
            className="btn-primary"
          >
            Novo Pedido
          </button>
        </div>
      </div>
    );
  }

  const size3x4 = PRICE_TABLE.find((r) => r.id === "3x4");

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-white">
      <div className="bg-gradient-to-r from-primary-500 via-rose-500 to-pink-500 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-5xl mb-4 block">📷</span>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">
            Revelação de Fotos
          </h1>
          <p className="text-white/90 text-lg">
            Envie suas fotos e escolha os tamanhos. Retirada na loja.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="card p-6 mb-8">
          <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary-500" />
            Tabela de Preços
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-gray-600 font-semibold">Tamanho</th>
                  <th className="text-left py-3 text-gray-600 font-semibold">Preço</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="py-2">10x15 cm</td>
                  <td>R$ 2,50 cada</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">3x4 cm</td>
                  <td>R$ 8,00 (6 fotos) · R$ 14,00 (12 fotos)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">13x18 cm</td>
                  <td>R$ 4,00 cada</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">15x20 cm</td>
                  <td>R$ 6,00 cada</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">20x25 cm</td>
                  <td>R$ 9,00 cada</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-4">
              Seus dados
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
                  placeholder="Seu nome"
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
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-4">
              Adicionar revelação
            </h2>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Tamanho
                </label>
                <select
                  value={addSize}
                  onChange={(e) => setAddSize(e.target.value)}
                  className="input-field !py-2"
                >
                  <option value="">Selecione</option>
                  {PRICE_TABLE.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              {addSize === "3x4" && size3x4?.type === "package" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Pacote
                  </label>
                  <select
                    value={addOption}
                    onChange={(e) => setAddOption(Number(e.target.value))}
                    className="input-field !py-2"
                  >
                    {size3x4.options?.map((o) => (
                      <option key={o.qty} value={o.qty}>
                        {o.qty} fotos — R$ {o.price.toFixed(2).replace(".", ",")}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min={1}
                  value={addQty}
                  onChange={(e) => setAddQty(Number(e.target.value))}
                  className="input-field !py-2 w-24"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn-primary !py-2 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {cart.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-600 mb-2">Seu pedido:</p>
                <ul className="space-y-2">
                  {cart.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <span>
                        {item.sizeLabel}
                        {item.optionLabel ? ` (${item.optionLabel})` : ""} x{item.quantity} = R${" "}
                        {item.subtotal.toFixed(2).replace(".", ",")}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-lg font-bold text-primary-600">
                  Total: R$ {total.toFixed(2).replace(".", ",")}
                </p>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-500" />
              Enviar fotos *
            </h2>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary-300 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="hidden"
              />
              {files.length > 0 ? (
                <div className="text-center p-2">
                  <ImageIcon className="w-10 h-10 text-primary-500 mx-auto mb-1" />
                  <p className="text-sm font-medium text-gray-700">
                    {files.length} foto(s) selecionada(s)
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-10 h-10 text-primary-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Clique para selecionar as fotos</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG</p>
                </div>
              )}
            </label>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field"
                rows={2}
                placeholder="Alguma instrução especial..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cart.length === 0 || files.length === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Pedido de Revelação
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
