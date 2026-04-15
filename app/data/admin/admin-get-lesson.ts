import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export default async function adminGetLesson(lessonId: string) {
  await requireAdmin();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: {
        select: { id: true, title: true, courseId: true },
      },
    },
  });

  return lesson;
}

export type AdminLessonDetailType = NonNullable<
  Awaited<ReturnType<typeof adminGetLesson>>
>;

