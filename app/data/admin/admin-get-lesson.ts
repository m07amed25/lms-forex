import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { env } from "@/lib/env";

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

  if (!lesson) return null;

  let videoUrl = "";
  if (lesson.videoFileKey) {
    const command = new GetObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: lesson.videoFileKey,
    });
    videoUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
  }

  return { ...lesson, videoUrl };
}

export type AdminLessonDetailType = NonNullable<
  Awaited<ReturnType<typeof adminGetLesson>>
>;

