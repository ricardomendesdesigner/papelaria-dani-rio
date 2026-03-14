import Banner from "@/components/Banner";
import Link from "next/link";
import {
  Store,
  Gamepad2,
  Printer,
  CalendarCheck,
  ArrowRight,
  Star,
  Truck,
  Shield,
  Clock,
  FileText,
  Camera,
} from "lucide-react";

const categories = [
  {
    title: "Papelaria",
    description: "Cadernos, canetas, mochilas e todo material escolar",
    icon: Store,
    href: "/papelaria",
    color: "from-primary-400 to-primary-600",
    emoji: "📚",
  },
  {
    title: "Brinquedos",
    description: "Diversão garantida para todas as idades",
    icon: Gamepad2,
    href: "/brinquedos",
    color: "from-purple-400 to-purple-600",
    emoji: "🧸",
  },
  {
    title: "Impressão",
    description: "Imprima documentos com rapidez e qualidade",
    icon: Printer,
    href: "/impressao",
    color: "from-blue-400 to-blue-600",
    emoji: "🖨️",
  },
  {
    title: "Revelação de Fotos",
    description: "Envie suas fotos e revele nos tamanhos 10x15, 3x4, 13x18 e mais",
    icon: Camera,
    href: "/revelacao",
    color: "from-pink-400 to-rose-500",
    emoji: "📷",
  },
  {
    title: "Agendamento",
    description: "Agende seu RG de forma prática e rápida",
    icon: CalendarCheck,
    href: "/agendamento",
    color: "from-orange-400 to-rose-500",
    emoji: "📋",
  },
  {
    title: "Currículo Online",
    description: "Faça seu currículo profissional por R$ 10,00",
    icon: FileText,
    href: "/curriculo",
    color: "from-emerald-400 to-emerald-600",
    emoji: "📄",
  },
];

const features = [
  {
    icon: Truck,
    title: "Entrega Rápida",
    description: "Receba seus produtos com agilidade",
  },
  {
    icon: Shield,
    title: "Pagamento Seguro",
    description: "PIX, cartão ou dinheiro",
  },
  {
    icon: Star,
    title: "Qualidade Garantida",
    description: "Produtos das melhores marcas",
  },
  {
    icon: Clock,
    title: "Atendimento Rápido",
    description: "WhatsApp para tirar dúvidas",
  },
];

export default function HomePage() {
  return (
    <>
      <Banner />

      {/* Categories Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">
              Nossos <span className="text-primary-500">Serviços</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Encontre tudo que precisa em um só lugar. Materiais escolares,
              brinquedos, impressão e muito mais!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="card group p-6 text-center hover:-translate-y-2"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}
                >
                  {cat.emoji}
                </div>
                <h3 className="font-display font-semibold text-lg text-gray-800 mb-2">
                  {cat.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{cat.description}</p>
                <span className="inline-flex items-center gap-1 text-primary-500 font-medium text-sm group-hover:gap-2 transition-all">
                  Ver mais <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <feat.icon className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-gray-500">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-primary-500 to-pink-500 rounded-3xl p-8 md:p-14 text-center text-white shadow-2xl shadow-primary-200">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Precisa de ajuda?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
              Fale com a gente pelo WhatsApp! Estamos prontos para te atender e
              tirar todas as suas dúvidas.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5521999999999"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold py-4 px-8 rounded-xl hover:bg-primary-50 transition-all shadow-xl hover:scale-105"
            >
              💬 Chamar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
