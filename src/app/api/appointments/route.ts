import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    where.date = { gte: start, lt: end };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return NextResponse.json(appointments);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, cpf, birthDate, fatherName, motherName, guardianCpf, phone, email, date, time, service, notes } = body;

    const existing = await prisma.appointment.findFirst({
      where: {
        date: new Date(date),
        time,
        status: { not: "cancelado" },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este horário já está reservado. Escolha outro." },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        name,
        cpf,
        birthDate,
        fatherName,
        motherName,
        guardianCpf: guardianCpf || null,
        phone,
        email: email || null,
        date: new Date(date),
        time,
        service,
        notes: notes || null,
      },
    });

    await prisma.cashRegister.create({
      data: {
        type: "servico",
        description: `Agendamento Identidade #${appointment.id} - ${name}`,
        amount: 10,
        method: null,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const appointment = await prisma.appointment.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar agendamento" },
      { status: 500 }
    );
  }
}
