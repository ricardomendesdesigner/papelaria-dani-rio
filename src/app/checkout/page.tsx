"use client";

import { useCart } from "@/context/CartContext";
import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { generatePixPayload } from "@/lib/pix";
import {
  CreditCard,
  QrCode,
  User,
  ShoppingBag,
  CheckCircle2,
  Copy,
  ImageIcon,
  MapPin,
  Truck,
  Search,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const paymentMethods = [
  { id: "pix", label: "PIX", icon: QrCode, description: "Pagamento instantâneo" },
  { id: "cartao", label: "Cartão", icon: CreditCard, description: "Crédito ou Débito" },
];

interface ShippingOption {
  service: string;
  code: string;
  price: number;
  days: number;
  error: string | null;
}

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("retirada");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingCalculated, setShippingCalculated] = useState(false);

  const selectedShippingOption = shippingOptions.find(
    (o) => o.code === selectedShipping
  );
  const shippingPrice = selectedShippingOption?.price || 0;
  const finalTotal = totalPrice + shippingPrice;

  const lookupCep = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      toast.error("CEP deve ter 8 dígitos!");
      return;
    }

    setCepLoading(true);
    try {
      const res = await fetch(`/api/cep/${cleanCep}`);
      const data = await res.json();
      if (res.ok) {
        setStreet(data.street || "");
        setNeighborhood(data.neighborhood || "");
        setCity(data.city || "");
        setState(data.state || "");
        toast.success("Endereço encontrado!");
        calcShipping(cleanCep);
      } else {
        toast.error(data.error || "CEP não encontrado.");
      }
    } catch {
      toast.error("Erro ao buscar CEP.");
    } finally {
      setCepLoading(false);
    }
  };

  const calcShipping = async (destinoCep: string) => {
    setShippingLoading(true);
    try {
      const res = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cepDestino: destinoCep }),
      });
      const data = await res.json();
      if (res.ok) {
        setShippingOptions(data.options);
        setSelectedShipping("retirada");
        setShippingCalculated(true);
      }
    } catch {
      toast.error("Erro ao calcular frete.");
    } finally {
      setShippingLoading(false);
    }
  };

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Carrinho vazio!");
      return;
    }

    if (selectedShipping !== "retirada" && !street) {
      toast.error("Preencha o endereço de entrega!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          paymentMethod,
          items: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
            unitPrice: i.price,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();

        if (paymentMethod === "cartao") {
          const stripeRes = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: [
                ...items.map((i) => ({
                  name: i.name,
                  price: i.price,
                  quantity: i.quantity,
                  image: i.image,
                })),
                ...(shippingPrice > 0
                  ? [
                      {
                        name: `Frete (${selectedShippingOption?.service})`,
                        price: shippingPrice,
                        quantity: 1,
                      },
                    ]
                  : []),
              ],
              customerName: name,
              customerPhone: phone,
              customerEmail: email,
              orderId: data.id,
            }),
          });
          const stripeData = await stripeRes.json();
          if (stripeData.url) {
            clearCart();
            window.location.href = stripeData.url;
            return;
          } else {
            toast.error("Erro ao redirecionar para pagamento.");
          }
        }

        setOrderId(data.id);
        setOrderTotal(finalTotal);
        setOrderComplete(true);
        clearCart();
        toast.success("Pedido realizado com sucesso!");
      } else {
        toast.error("Erro ao processar pedido. Tente novamente.");
      }
    } catch {
      toast.error("Erro ao processar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-4">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="font-display font-bold text-3xl text-gray-800 mb-3">
            Pedido Confirmado!
          </h2>
          <p className="text-gray-500 mb-2">
            Pedido <span className="font-bold">#{orderId}</span> realizado com sucesso.
          </p>

          {paymentMethod === "pix" &&
            (() => {
              const pixPayload = generatePixPayload({
                pixKey: "+5521978836482",
                merchantName: "Papelaria Dani Rio",
                merchantCity: "Rio de Janeiro",
                amount: orderTotal,
                txId: `PED${orderId}`,
              });
              return (
                <div className="card p-6 my-6 text-left">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary-500" />
                    Pague via PIX
                  </h3>

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
                    Escaneie o QR Code com o app do seu banco
                  </p>

                  <div className="bg-primary-50 p-4 rounded-xl mb-3">
                    <p className="text-xs text-gray-500 mb-1">
                      Ou copie o código PIX:
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-mono text-primary-700 break-all flex-1">
                        {pixPayload}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pixPayload);
                          toast.success("Código PIX copiado!");
                        }}
                        className="p-1.5 hover:bg-primary-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Copy className="w-4 h-4 text-primary-500" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl mb-3">
                    <p className="text-xs text-gray-500 mb-1">
                      Chave PIX (Telefone):
                    </p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-primary-700">
                        21 97883-6482
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("21978836482");
                          toast.success("Chave copiada!");
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4 text-primary-500" />
                      </button>
                    </div>
                  </div>

                  <div className="text-center mt-4 p-3 bg-green-50 rounded-xl">
                    <p className="text-lg font-bold text-green-700">
                      R$ {orderTotal.toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Valor já incluso no QR Code
                    </p>
                  </div>

                  <p className="text-xs text-gray-400 mt-3 text-center">
                    Após o pagamento, envie o comprovante pelo WhatsApp.
                  </p>
                </div>
              );
            })()}

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

          <p className="text-sm text-gray-500 mb-6">
            Entraremos em contato pelo WhatsApp com mais informações.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-primary">
              Voltar ao Início
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5521978836482"}?text=${encodeURIComponent(`Olá! Acabei de realizar o pedido #${orderId}. Gostaria de confirmar.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              💬 Confirmar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <span className="text-7xl mb-6 block">🛒</span>
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-3">
            Carrinho Vazio
          </h2>
          <Link href="/papelaria" className="btn-primary mt-4 inline-block">
            Ver Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 mb-8">
          💳 Finalizar Compra
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-500" />
                  Seus Dados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
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
                  <MapPin className="w-5 h-5 text-primary-500" />
                  Endereço de Entrega
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(formatCep(e.target.value))}
                        className="input-field flex-1"
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      <button
                        type="button"
                        onClick={lookupCep}
                        disabled={cepLoading}
                        className="btn-primary !py-2 !px-4 flex items-center gap-2 text-sm"
                      >
                        {cepLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                        Buscar
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Digite o CEP e clique em Buscar para preencher o endereço
                      e calcular o frete
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rua
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="input-field"
                      placeholder="Rua, Avenida..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="input-field"
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="input-field"
                      placeholder="Apto, Bloco..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="input-field"
                      placeholder="Bairro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-field"
                      placeholder="Cidade"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="input-field"
                      placeholder="UF"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary-500" />
                  Frete
                </h2>

                {shippingLoading ? (
                  <div className="flex items-center gap-3 py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                    <span className="text-sm text-gray-500">
                      Calculando frete com os Correios...
                    </span>
                  </div>
                ) : shippingCalculated ? (
                  <div className="space-y-3">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.code}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedShipping === option.code
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-primary-300"
                        } ${option.error ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value={option.code}
                            checked={selectedShipping === option.code}
                            onChange={(e) =>
                              !option.error &&
                              setSelectedShipping(e.target.value)
                            }
                            disabled={!!option.error}
                            className="w-4 h-4 text-primary-500 accent-pink-500"
                          />
                          <div>
                            <p className="font-semibold text-sm text-gray-800">
                              {option.service}
                            </p>
                            {option.error ? (
                              <p className="text-xs text-red-500">
                                {option.error}
                              </p>
                            ) : option.days > 0 ? (
                              <p className="text-xs text-gray-500">
                                Entrega em até {option.days} dias úteis
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500">
                                Retire na loja sem custo
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`font-bold text-sm ${
                            option.price === 0
                              ? "text-green-600"
                              : "text-gray-800"
                          }`}
                        >
                          {option.price === 0
                            ? "Grátis"
                            : `R$ ${option.price.toFixed(2).replace(".", ",")}`}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <Truck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">
                      Digite seu CEP acima para calcular o frete
                    </p>
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-500" />
                  Forma de Pagamento
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
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
                          paymentMethod === method.id
                            ? "text-primary-500"
                            : "text-gray-400"
                        }`}
                      />
                      <p className="font-semibold text-sm text-gray-800">
                        {method.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {method.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-28">
                <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary-500" />
                  Resumo
                </h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {item.image ? (
                          <div className="w-8 h-8 relative rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                        ) : (
                          <ImageIcon className="w-5 h-5 text-primary-300 flex-shrink-0" />
                        )}
                        <span className="truncate text-gray-600">
                          {item.name} x{item.quantity}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800 ml-2">
                        R${" "}
                        {(item.price * item.quantity)
                          .toFixed(2)
                          .replace(".", ",")}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="border-primary-100 mb-3" />

                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frete ({selectedShippingOption?.service || "—"})</span>
                    <span
                      className={
                        shippingPrice === 0
                          ? "text-green-600 font-medium"
                          : ""
                      }
                    >
                      {shippingPrice === 0
                        ? "Grátis"
                        : `R$ ${shippingPrice.toFixed(2).replace(".", ",")}`}
                    </span>
                  </div>
                </div>

                <hr className="border-primary-100 mb-3" />

                <div className="flex justify-between text-lg font-bold text-primary-600 mb-6">
                  <span>Total</span>
                  <span>R$ {finalTotal.toFixed(2).replace(".", ",")}</span>
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
                      <CheckCircle2 className="w-5 h-5" />
                      Confirmar Pedido
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
