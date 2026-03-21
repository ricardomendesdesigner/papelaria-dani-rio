"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import {
  ShoppingCart,
  Menu,
  X,
  Store,
  Gamepad2,
  Printer,
  CalendarCheck,
  Home,
  ShieldCheck,
  FileText,
  Camera,
  ChevronDown,
  Briefcase,
  Palette,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Início", icon: Home },
  { href: "/papelaria", label: "Papelaria", icon: Store },
  { href: "/brinquedos", label: "Brinquedos", icon: Gamepad2 },
  { href: "/grafica", label: "Gráfica", icon: Palette },
];

const servicosLinks = [
  { href: "/revelacao", label: "Revelação de Fotos", icon: Camera },
  { href: "/impressao", label: "Impressão", icon: Printer },
  { href: "/agendamento", label: "Agendamento", icon: CalendarCheck },
  { href: "/curriculo", label: "Currículo", icon: FileText },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicosOpen, setServicosOpen] = useState(false);
  const servicosRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (servicosRef.current && !servicosRef.current.contains(event.target as Node)) {
        setServicosOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg md:text-xl text-primary-600 leading-tight">
                Papelaria Dani Rio
              </h1>
              <p className="text-[10px] text-primary-400 font-medium -mt-0.5 hidden sm:block">
                Sua papelaria completa
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            <div className="relative" ref={servicosRef}>
              <button
                type="button"
                onClick={() => setServicosOpen(!servicosOpen)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  servicosOpen ? "text-primary-600 bg-primary-50" : "text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Serviços
                <ChevronDown className={`w-4 h-4 transition-transform ${servicosOpen ? "rotate-180" : ""}`} />
              </button>
              {servicosOpen && (
                <div className="absolute top-full left-0 mt-1 py-2 w-52 bg-white rounded-xl border border-gray-100 shadow-lg z-50">
                  {servicosLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setServicosOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all"
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Link>
            <Link
              href="/carrinho"
              className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 font-medium transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Carrinho</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-primary-50 transition-all text-gray-600"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-primary-100 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all"
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Serviços
              </p>
              {servicosLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all"
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="font-medium">Painel Admin</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
