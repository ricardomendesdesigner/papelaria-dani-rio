import Link from "next/link";
import { Store, Phone, Mail, MapPin, Clock, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-primary-50 to-primary-100 border-t border-primary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg text-primary-700">
                Papelaria Dani Rio
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Sua papelaria completa no Rio de Janeiro. Materiais escolares,
              brinquedos, impressão e muito mais!
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-gray-800 mb-4">
              Links Rápidos
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/papelaria", label: "Papelaria" },
                { href: "/brinquedos", label: "Brinquedos" },
                { href: "/grafica", label: "Gráfica" },
                { href: "/impressao", label: "Impressão" },
                { href: "/revelacao", label: "Revelação" },
                { href: "/agendamento", label: "Agendamento" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-gray-800 mb-4">
              Contato
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-primary-500" />
                21 97883-6482
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-primary-500" />
                papelariadanirio@gmail.com
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-primary-500" />
                Rio de Janeiro, RJ
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-gray-800 mb-4">
              Horário
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-primary-500" />
                Seg a Sex: 10h às 20h
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 pl-6">
                Sábado: 10h às 19h
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 pl-6">
                Domingo: Fechado
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-200 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
            Feito com <Heart className="w-4 h-4 text-primary-500 fill-primary-500" /> Papelaria Dani Rio &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
