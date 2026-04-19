import "server-only";

import { prisma } from "@/lib/db";

export async function getUserLearningStats(userId: string) {
  const [totalEnrolled, totalLessonsCompleted, memberSinceResult, enrollments] =
    await Promise.all([
      prisma.enrollment.count({
        where: { userId, status: "Active" },
      }),
      prisma.userProgress.count({
        where: { userId },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      }),
      prisma.enrollment.findMany({
        where: { userId, status: "Active" },
        select: {
          course: {
            select: {
              id: true,
              chapters: {
                select: {
                  lessons: {
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

  // Calculate completed and in-progress courses
  let completedCourses = 0;
  let inProgressCourses = 0;

  for (const enrollment of enrollments) {
    const allLessonIds = enrollment.course.chapters.flatMap((ch) =>
      ch.lessons.map((l) => l.id),
    );
    const total = allLessonIds.length;

    if (total === 0) continue;

    const completed = await prisma.userProgress.count({
      where: {
        userId,
        lessonId: { in: allLessonIds },
      },
    });

    const percentage = Math.round((completed / total) * 100);

    if (percentage >= 100) {
      completedCourses++;
    } else {
      inProgressCourses++;
    }
  }

  return {
    totalEnrolled,
    completedCourses,
    inProgressCourses,
    totalLessonsCompleted,
    memberSince: memberSinceResult?.createdAt ?? new Date(),
  };
}

