import "server-only";

import { prisma } from "@/lib/db";

export async function getCourseProgress(userId: string, courseId: string) {
  const [completed, total] = await Promise.all([
    prisma.userProgress.count({
      where: { userId, lesson: { chapter: { courseId } } },
    }),
    prisma.lesson.count({
      where: { chapter: { courseId } },
    }),
  ]);

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

