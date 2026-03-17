import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const where: Record<string, unknown> = { active: true };
  if (category) where.category = category;

  const products = await prisma.product.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        image: body.image,
        category: body.category,
        stock: parseInt(body.stock) || 0,
        active: body.active ?? true,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await prisma.product.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        image: body.image,
        category: body.category,
        stock: parseInt(body.stock),
        active: body.active,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID necessário" }, { status: 400 });

    // Em vez de deletar de verdade (que quebra FKs em pedidos),
    // marcamos o produto como inativo (soft delete).
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { active: false },
    });
    return NextResponse.json({ success: true, softDeleted: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Erro ao deletar produto" }, { status: 500 });
  }
}
