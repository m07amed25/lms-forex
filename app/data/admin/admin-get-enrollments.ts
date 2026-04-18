import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetEnrollments(courseId: string) {
  await requireAdmin();

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          amountCents: true,
          paymentMethod: true,
          status: true,
        },
      },
    },
  });

  return enrollments.map((e) => ({
    id: e.id,
    userName: e.user.name,
    userEmail: e.user.email,
    status: e.status,
    createdAt: e.createdAt,
    paymentMethod: e.orders[0]?.paymentMethod ?? null,
    amountCents: e.orders[0]?.amountCents ?? null,
    orderStatus: e.orders[0]?.status ?? null,
  }));
}

export type AdminEnrollmentItem = Awaited<
  ReturnType<typeof adminGetEnrollments>
>[number];

