import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Envie uma imagem (JPG, PNG, WebP) ou PDF do comprovante." },
        { status: 400 }
      );
    }

    const uploadsDir = join(process.cwd(), "public", "comprovantes");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ext === "jpeg" ? "jpg" : ext;
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;
    const filePath = join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const path = `/comprovantes/${fileName}`;
    return NextResponse.json({ path }, { status: 201 });
  } catch (error) {
    console.error("Error uploading comprovante:", error);
    return NextResponse.json({ error: "Erro ao enviar comprovante" }, { status: 500 });
  }
}
