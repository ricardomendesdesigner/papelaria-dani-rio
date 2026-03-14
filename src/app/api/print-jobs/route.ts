import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const printJobs = await prisma.printJob.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(printJobs);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const copies = parseInt(formData.get("copies") as string) || 1;
    const colorMode = (formData.get("colorMode") as string) || "pb";
    const paperSize = (formData.get("paperSize") as string) || "A4";
    const sided = (formData.get("sided") as string) || "frente";
    const price = parseFloat(formData.get("price") as string) || 0;
    const notes = formData.get("notes") as string;

    let fileName = "no-file";
    if (file && file.size > 0) {
      const uploadsDir = join(process.cwd(), "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const uniqueName = `${Date.now()}-${file.name}`;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(join(uploadsDir, uniqueName), buffer);
      fileName = uniqueName;
    }

    const printJob = await prisma.printJob.create({
      data: {
        name,
        phone,
        email: email || null,
        fileName,
        copies,
        colorMode,
        paperSize,
        sided,
        price,
        notes: notes || null,
      },
    });

    await prisma.cashRegister.create({
      data: {
        type: "impressao",
        description: `Impressão #${printJob.id} - ${name}`,
        amount: price,
        method: "pendente",
      },
    });

    return NextResponse.json(printJob, { status: 201 });
  } catch (error) {
    console.error("Error creating print job:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido de impressão" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const printJob = await prisma.printJob.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json(printJob);
  } catch (error) {
    console.error("Error updating print job:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar impressão" },
      { status: 500 }
    );
  }
}
