import "server-only";

import { prisma } from "@/lib/db";

export async function getCoursePlayerData(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      chapters: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              position: true,
              videoFileKey: true,
            },
          },
        },
      },
    },
  });

  if (!course) return null;

  const completedLessons = await prisma.userProgress.findMany({
    where: { userId, lesson: { chapter: { courseId } } },
    select: { lessonId: true },
  });

  const completedIds = new Set(completedLessons.map((p) => p.lessonId));

  let total = 0;
  const chapters = course.chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    position: chapter.position,
    lessons: chapter.lessons.map((lesson) => {
      total++;
      return {
        id: lesson.id,
        title: lesson.title,
        position: lesson.position,
        hasVideo: Boolean(lesson.videoFileKey),
        isCompleted: completedIds.has(lesson.id),
      };
    }),
  }));

  const completed = completedIds.size;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    course: { id: course.id, title: course.title },
    chapters,
    progress: { completed, total, percentage },
  };
}

