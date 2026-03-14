"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    title: "Bem-vindo à Papelaria Dani Rio!",
    subtitle: "Tudo que você precisa em materiais escolares e de escritório",
    cta: "Ver Produtos",
    href: "/papelaria",
    gradient: "from-primary-400 via-primary-500 to-pink-500",
    emoji: "📚",
  },
  {
    title: "Brinquedos para Todas as Idades",
    subtitle: "Diversão garantida com os melhores brinquedos do mercado",
    cta: "Ver Brinquedos",
    href: "/brinquedos",
    gradient: "from-purple-400 via-primary-500 to-pink-400",
    emoji: "🧸",
  },
  {
    title: "Serviço de Impressão",
    subtitle: "Imprima seus documentos com qualidade e rapidez",
    cta: "Solicitar Impressão",
    href: "/impressao",
    gradient: "from-blue-400 via-primary-400 to-primary-500",
    emoji: "🖨️",
  },
  {
    title: "Agendamento de Identidade",
    subtitle: "Agende seu RG e outros documentos de forma prática",
    cta: "Agendar Agora",
    href: "/agendamento",
    gradient: "from-primary-500 via-rose-400 to-orange-400",
    emoji: "📋",
  },
];

export default function Banner() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[420px] md:h-[500px]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              i === current
                ? "opacity-100 translate-x-0"
                : i < current
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            }`}
          >
            <div
              className={`h-full bg-gradient-to-br ${slide.gradient} flex items-center`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
                <div className="flex items-center justify-between">
                  <div className="max-w-2xl">
                    <span className="text-6xl md:text-8xl mb-4 block animate-float">
                      {slide.emoji}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-lg md:text-xl text-white/90 mb-8">
                      {slide.subtitle}
                    </p>
                    <Link
                      href={slide.href}
                      className="inline-flex items-center bg-white text-primary-600 font-bold py-3 px-8 rounded-xl hover:bg-primary-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                      {slide.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-white" : "w-2.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
