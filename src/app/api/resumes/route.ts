import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const resumes = await prisma.resume.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(resumes);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const resume = await prisma.resume.create({
      data: {
        fullName: body.fullName,
        birthDate: body.birthDate,
        maritalStatus: body.maritalStatus,
        nationality: body.nationality,
        address: body.address,
        city: body.city,
        phone: body.phone,
        email: body.email,
        cnh: body.cnh || null,
        objective: body.objective,
        educationLevel: body.educationLevel,
        course: body.course || null,
        institution: body.institution || null,
        conclusionYear: body.conclusionYear || null,
        experiences: body.experiences,
        skills: body.skills,
        paymentMethod: body.paymentMethod || "pix",
        price: 10.0,
        comprovantePath: body.comprovantePath || null,
      },
    });

    await prisma.cashRegister.create({
      data: {
        type: "servico",
        description: `Currículo #${resume.id} - ${body.fullName}`,
        amount: 10.0,
        method: body.paymentMethod || "pix",
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { error: "Erro ao criar currículo" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const resume = await prisma.resume.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar currículo" },
      { status: 500 }
    );
  }
}
