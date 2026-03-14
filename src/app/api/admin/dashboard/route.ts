import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalProducts,
      totalOrders,
      totalAppointments,
      totalPrintJobs,
      todayOrders,
      todayRevenue,
      pendingOrders,
      pendingAppointments,
      pendingPrintJobs,
      cashRegister,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.appointment.count(),
      prisma.printJob.count(),
      prisma.order.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow }, status: { not: "cancelado" } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { status: "pendente" } }),
      prisma.appointment.count({ where: { status: "pendente" } }),
      prisma.printJob.count({ where: { status: "pendente" } }),
      prisma.cashRegister.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { items: { include: { product: true } } },
      }),
    ]);

    const totalRevenue = await prisma.cashRegister.aggregate({
      where: { type: { in: ["venda", "impressao", "servico"] } },
      _sum: { amount: true },
    });

    return NextResponse.json({
      stats: {
        totalProducts,
        totalOrders,
        totalAppointments,
        totalPrintJobs,
        todayOrders,
        todayRevenue: todayRevenue._sum.total || 0,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingOrders,
        pendingAppointments,
        pendingPrintJobs,
      },
      cashRegister,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Erro ao carregar dashboard" }, { status: 500 });
  }
}
