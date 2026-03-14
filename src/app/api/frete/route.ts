import { NextRequest, NextResponse } from "next/server";

const STORE_CEP = process.env.STORE_CEP || "20000000";

interface CorreiosService {
  code: string;
  name: string;
}

const SERVICES: CorreiosService[] = [
  { code: "04014", name: "SEDEX" },
  { code: "04510", name: "PAC" },
];

async function calcCorreios(servicoCode: string, cepDestino: string) {
  const params = new URLSearchParams({
    nCdEmpresa: "",
    sDsSenha: "",
    nCdServico: servicoCode,
    sCepOrigem: STORE_CEP.replace(/\D/g, ""),
    sCepDestino: cepDestino.replace(/\D/g, ""),
    nVlPeso: "1",
    nCdFormato: "1",
    nVlComprimento: "20",
    nVlAltura: "10",
    nVlLargura: "15",
    nVlDiametro: "0",
    sCdMaoPropria: "N",
    nVlValorDeclarado: "0",
    sCdAvisoRecebimento: "N",
    StrRetorno: "xml",
  });

  const url = `http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx/CalcPrecoPrazo?${params}`;
  const res = await fetch(url);
  const text = await res.text();

  const valor = text.match(/<Valor>(.*?)<\/Valor>/)?.[1] || "0";
  const prazo = text.match(/<PrazoEntrega>(.*?)<\/PrazoEntrega>/)?.[1] || "0";
  const erro = text.match(/<Erro>(.*?)<\/Erro>/)?.[1] || "";
  const msgErro = text.match(/<MsgErro>(.*?)<\/MsgErro>/)?.[1] || "";

  return {
    valor: parseFloat(valor.replace(",", ".")),
    prazo: parseInt(prazo),
    erro,
    msgErro,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cepDestino } = body;

    if (!cepDestino || cepDestino.replace(/\D/g, "").length !== 8) {
      return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
    }

    const results = await Promise.all(
      SERVICES.map(async (service) => {
        try {
          const result = await calcCorreios(service.code, cepDestino);
          return {
            service: service.name,
            code: service.code,
            price: result.valor,
            days: result.prazo,
            error: result.erro !== "0" ? result.msgErro : null,
          };
        } catch {
          return {
            service: service.name,
            code: service.code,
            price: 0,
            days: 0,
            error: "Serviço indisponível",
          };
        }
      })
    );

    const retirada = {
      service: "Retirada na Loja",
      code: "retirada",
      price: 0,
      days: 0,
      error: null,
    };

    return NextResponse.json({ options: [retirada, ...results] });
  } catch {
    return NextResponse.json(
      { error: "Erro ao calcular frete" },
      { status: 500 }
    );
  }
}
