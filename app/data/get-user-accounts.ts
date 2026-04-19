import "server-only";

import { prisma } from "@/lib/db";

export async function getUserAccounts(userId: string) {
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: {
      providerId: true,
      createdAt: true,
    },
  });

  return accounts;
}

