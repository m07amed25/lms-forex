import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { Prisma } from "@prisma/client";

const USERS_PAGE_SIZE = 20;

export { USERS_PAGE_SIZE };

export async function adminGetUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
}) {
  await requireAdmin();

  const conditions: Prisma.UserWhereInput[] = [];

  if (params?.search) {
    conditions.push({
      OR: [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ],
    });
  }

  if (params?.role === "admin") {
    conditions.push({ role: "admin" });
  } else if (params?.role === "user") {
    conditions.push({
      OR: [{ role: { not: "admin" } }, { role: null }],
    });
  }

  if (params?.status === "banned") {
    conditions.push({ banned: true });
  } else if (params?.status === "active") {
    conditions.push({
      OR: [{ banned: false }, { banned: null }],
    });
  }

  const where: Prisma.UserWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const currentPage = Math.max(1, params?.page ?? 1);

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * USERS_PAGE_SIZE,
      take: USERS_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / USERS_PAGE_SIZE);

  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      banned: u.banned ?? false,
      banReason: u.banReason,
      banExpires: u.banExpires,
      createdAt: u.createdAt,
      enrollmentCount: u._count.enrollments,
    })),
    totalCount,
    totalPages,
    currentPage,
  };
}

export type AdminUserItem = Awaited<
  ReturnType<typeof adminGetUsers>
>["users"][number];

