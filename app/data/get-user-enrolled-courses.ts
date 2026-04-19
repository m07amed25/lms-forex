import "server-only";

import { prisma } from "@/lib/db";

export async function getUserEnrolledCourses(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: "Active" },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          fileKey: true,
          level: true,
          category: true,
          chapters: {
            orderBy: { position: "asc" },
            select: {
              lessons: {
                orderBy: { position: "asc" },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  const results = await Promise.all(
    enrollments.map(async ({ course, createdAt }) => {
      const allLessonIds = course.chapters.flatMap((ch) =>
        ch.lessons.map((l) => l.id),
      );
      const total = allLessonIds.length;

      const completed =
        total > 0
          ? await prisma.userProgress.count({
              where: {
                userId,
                lessonId: { in: allLessonIds },
              },
            })
          : 0;

      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        courseId: course.id,
        title: course.title,
        slug: course.slug,
        fileKey: course.fileKey,
        level: course.level,
        category: course.category,
        enrolledAt: createdAt,
        progress: { completed, total, percentage },
        firstLessonId: allLessonIds[0] ?? null,
      };
    }),
  );

  return results;
}

