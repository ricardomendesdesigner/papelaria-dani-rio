import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      (where.createdAt as Record<string, unknown>).lt = end;
    }
  }

  const entries = await prisma.cashRegister.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const totals = await prisma.cashRegister.aggregate({
    where,
    _sum: { amount: true },
    _count: true,
  });

  return NextResponse.json({
    entries,
    total: totals._sum.amount || 0,
    count: totals._count,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entry = await prisma.cashRegister.create({
      data: {
        type: body.type,
        description: body.description,
        amount: parseFloat(body.amount),
        method: body.method || null,
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Cash register error:", error);
    return NextResponse.json(
      { error: "Erro ao registrar no caixa" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID necessário" }, { status: 400 });
    }

    await prisma.cashRegister.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cash register cancel error:", error);
    return NextResponse.json(
      { error: "Erro ao cancelar venda" },
      { status: 500 }
    );
  }
}
