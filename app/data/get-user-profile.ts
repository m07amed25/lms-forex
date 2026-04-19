import "server-only";

import { prisma } from "@/lib/db";

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      bio: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}



