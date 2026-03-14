import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const orders = await prisma.photoRevelation.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = (formData.get("name") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const email = (formData.get("email") as string)?.trim() || null;
    const notes = (formData.get("notes") as string)?.trim() || null;
    const itemsJson = formData.get("items") as string;
    const total = parseFloat((formData.get("total") as string) || "0");

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Nome e telefone são obrigatórios." },
        { status: 400 }
      );
    }

    const items = JSON.parse(itemsJson || "[]");
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Adicione pelo menos um tamanho de revelação." },
        { status: 400 }
      );
    }

    const uploadsDir = join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileNames: string[] = [];
    const files = formData.getAll("files") as File[];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.size > 0) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const uniqueName = `revelacao-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const bytes = await file.arrayBuffer();
        await writeFile(join(uploadsDir, uniqueName), Buffer.from(bytes));
        fileNames.push(uniqueName);
      }
    }

    const order = await prisma.photoRevelation.create({
      data: {
        name,
        phone,
        email,
        items: JSON.stringify(items),
        fileNames: JSON.stringify(fileNames),
        total,
        notes,
      },
    });

    await prisma.cashRegister.create({
      data: {
        type: "impressao",
        description: `Revelação #${order.id} - ${name}`,
        amount: total,
        method: null,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating photo revelation order:", error);
    return NextResponse.json(
      { error: "Erro ao enviar pedido de revelação." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const order = await prisma.photoRevelation.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating photo revelation:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status." },
      { status: 500 }
    );
  }
}
