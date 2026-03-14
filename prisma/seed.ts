import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Admin user
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "admin123",
    10
  );
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: { password: hashedPassword },
    create: { username: "admin", password: hashedPassword },
  });
  console.log("✅ Admin criado (admin / admin123)");

  // Papelaria products
  const papelaria = [
    {
      name: "Caderno Espiral 200 folhas",
      description: "Caderno universitário com capa dura e espiral reforçado",
      price: 24.9,
      image: "📓",
      category: "papelaria",
      stock: 50,
    },
    {
      name: "Kit 12 Canetas Coloridas",
      description: "Canetas esferográficas coloridas de ponta fina",
      price: 15.9,
      image: "🖊️",
      category: "papelaria",
      stock: 80,
    },
    {
      name: "Mochila Escolar Resistente",
      description: "Mochila com compartimento para notebook e bolsos laterais",
      price: 89.9,
      image: "🎒",
      category: "papelaria",
      stock: 25,
    },
    {
      name: "Estojo Duplo",
      description: "Estojo escolar com dois compartimentos e zíper",
      price: 19.9,
      image: "✏️",
      category: "papelaria",
      stock: 60,
    },
    {
      name: "Lápis de Cor 24 cores",
      description: "Caixa de lápis de cor com 24 cores vibrantes",
      price: 22.5,
      image: "🖍️",
      category: "papelaria",
      stock: 40,
    },
    {
      name: "Borracha Branca Macia",
      description: "Borracha macia que não borra o papel",
      price: 2.5,
      image: "📝",
      category: "papelaria",
      stock: 200,
    },
    {
      name: "Régua 30cm Transparente",
      description: "Régua transparente de acrílico resistente",
      price: 3.9,
      image: "📏",
      category: "papelaria",
      stock: 100,
    },
    {
      name: "Tesoura Escolar Ponta Redonda",
      description: "Tesoura segura para uso infantil",
      price: 8.9,
      image: "✂️",
      category: "papelaria",
      stock: 70,
    },
    {
      name: "Cola Bastão 21g",
      description: "Cola bastão de secagem rápida e limpa",
      price: 4.5,
      image: "📎",
      category: "papelaria",
      stock: 120,
    },
    {
      name: "Papel Sulfite A4 500 folhas",
      description: "Resma de papel sulfite 75g/m² branco",
      price: 28.9,
      image: "📄",
      category: "papelaria",
      stock: 30,
    },
    {
      name: "Marca-texto Kit 6 cores",
      description: "Kit com 6 marca-textos de cores fluorescentes",
      price: 18.9,
      image: "🔖",
      category: "papelaria",
      stock: 45,
    },
    {
      name: "Pasta Organizadora A4",
      description: "Pasta com elástico para organização de documentos",
      price: 7.9,
      image: "📁",
      category: "papelaria",
      stock: 80,
    },
    {
      name: "Apontador com Depósito",
      description: "Apontador com depósito para aparas",
      price: 5.9,
      image: "📌",
      category: "papelaria",
      stock: 90,
    },
    {
      name: "Caderno de Desenho A3",
      description: "Caderno de desenho com folhas grossas para aquarela",
      price: 32.9,
      image: "📖",
      category: "papelaria",
      stock: 20,
    },
    {
      name: "Kit Material Escolar Completo",
      description: "Kit com caderno, canetas, lápis, borracha e régua",
      price: 59.9,
      image: "📚",
      category: "papelaria",
      stock: 15,
    },
    {
      name: "Corretivo Líquido",
      description: "Corretivo líquido de secagem rápida",
      price: 6.9,
      image: "📐",
      category: "papelaria",
      stock: 65,
    },
  ];

  // Brinquedos products
  const brinquedos = [
    {
      name: "Boneca Articulada Fashion",
      description: "Boneca articulada com roupas e acessórios trocáveis",
      price: 49.9,
      image: "👸",
      category: "brinquedo",
      stock: 20,
    },
    {
      name: "Carrinho de Controle Remoto",
      description: "Carrinho com controle remoto de alta velocidade",
      price: 79.9,
      image: "🚗",
      category: "brinquedo",
      stock: 15,
    },
    {
      name: "Jogo de Tabuleiro Diversão",
      description: "Jogo de tabuleiro para toda a família",
      price: 39.9,
      image: "🎲",
      category: "brinquedo",
      stock: 25,
    },
    {
      name: "Quebra-Cabeça 500 Peças",
      description: "Quebra-cabeça com imagem de paisagem",
      price: 34.9,
      image: "🧩",
      category: "brinquedo",
      stock: 30,
    },
    {
      name: "Bola de Futebol Oficial",
      description: "Bola de futebol tamanho oficial com costura reforçada",
      price: 44.9,
      image: "⚽",
      category: "brinquedo",
      stock: 35,
    },
    {
      name: "Kit de Massinha 10 Cores",
      description: "Kit com 10 potes de massinha de modelar colorida",
      price: 24.9,
      image: "🎨",
      category: "brinquedo",
      stock: 40,
    },
    {
      name: "Robô Educativo Programável",
      description: "Robô para crianças aprenderem programação básica",
      price: 129.9,
      image: "🤖",
      category: "brinquedo",
      stock: 10,
    },
    {
      name: "Pelúcia Urso Grande",
      description: "Urso de pelúcia macio e fofinho, 50cm",
      price: 59.9,
      image: "🧸",
      category: "brinquedo",
      stock: 20,
    },
    {
      name: "Kit de Pintura Infantil",
      description: "Kit com tintas, pincéis e tela para pintura infantil",
      price: 35.9,
      image: "🎭",
      category: "brinquedo",
      stock: 25,
    },
    {
      name: "Dinossauro com Som e Luz",
      description: "Dinossauro articulado com efeitos de som e luz",
      price: 54.9,
      image: "🦖",
      category: "brinquedo",
      stock: 18,
    },
    {
      name: "Bola de Basquete",
      description: "Bola de basquete profissional tamanho 7",
      price: 64.9,
      image: "🏀",
      category: "brinquedo",
      stock: 20,
    },
    {
      name: "Violão Infantil de Brinquedo",
      description: "Violão colorido para crianças, com cordas de nylon",
      price: 45.9,
      image: "🎸",
      category: "brinquedo",
      stock: 12,
    },
  ];

  const allProducts = [...papelaria, ...brinquedos];

  for (const product of allProducts) {
    await prisma.product.upsert({
      where: { id: allProducts.indexOf(product) + 1 },
      update: product,
      create: product,
    });
  }
  console.log(`✅ ${allProducts.length} produtos criados`);

  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
