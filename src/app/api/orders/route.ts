import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerEmail, paymentMethod, items } = body;

    const total = items.reduce(
      (acc: number, item: { quantity: number; unitPrice: number }) =>
        acc + item.quantity * item.unitPrice,
      0
    );

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        total,
        paymentMethod,
        items: {
          create: items.map((item: { productId: number; quantity: number; unitPrice: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await prisma.cashRegister.create({
      data: {
        type: "venda",
        description: `Pedido #${order.id} - ${customerName}`,
        amount: total,
        method: paymentMethod,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const order = await prisma.order.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 500 });
  }
}
