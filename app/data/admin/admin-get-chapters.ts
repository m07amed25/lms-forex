import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export default async function adminGetChapters(courseId: string) {
  await requireAdmin();

  const chapters = await prisma.chapter.findMany({
    where: { courseId },
    orderBy: { position: "asc" },
    include: {
      _count: { select: { lessons: true } },
      lessons: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          position: true,
          isFreePreview: true,
          videoFileKey: true,
        },
      },
    },
  });

  return chapters;
}

export type AdminChaptersType = Awaited<ReturnType<typeof adminGetChapters>>;
export type AdminChapterType = AdminChaptersType[number];

