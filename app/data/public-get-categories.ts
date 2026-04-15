import "server-only";

import { prisma } from "@/lib/db";

export default async function publicGetCategories(): Promise<string[]> {
  const results = await prisma.course.findMany({
    where: { isPublished: true, status: "Published" },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return results.map((r) => r.category);
}

