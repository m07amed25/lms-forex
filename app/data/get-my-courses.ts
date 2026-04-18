import "server-only";

import { prisma } from "@/lib/db";

export async function getMyCoursesData(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: "Active" },
    select: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          fileKey: true,
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
    enrollments.map(async ({ course }) => {
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

      // Find next incomplete lesson
      let nextLessonId: string | null = null;
      if (percentage < 100 && total > 0) {
        const completedSet = new Set(
          (
            await prisma.userProgress.findMany({
              where: { userId, lessonId: { in: allLessonIds } },
              select: { lessonId: true },
            })
          ).map((p) => p.lessonId),
        );

        for (const chapter of course.chapters) {
          for (const lesson of chapter.lessons) {
            if (!completedSet.has(lesson.id)) {
              nextLessonId = lesson.id;
              break;
            }
          }
          if (nextLessonId) break;
        }
      }

      return {
        courseId: course.id,
        title: course.title,
        slug: course.slug,
        fileKey: course.fileKey,
        progress: percentage,
        nextLessonId,
      };
    }),
  );

  return results;
}

