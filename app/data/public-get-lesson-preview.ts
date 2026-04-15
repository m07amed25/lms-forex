import "server-only";

import { prisma } from "@/lib/db";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { env } from "@/lib/env";
import { tiptapJsonToHtml } from "@/lib/tiptap-html";

export default async function publicGetLessonPreview(lessonId: string) {
  if (!lessonId || !lessonId.trim()) return null;

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
      isFreePreview: true,
      chapter: {
        course: {
          isPublished: true,
          status: "Published",
        },
      },
    },
    select: {
      id: true,
      title: true,
      content: true,
      videoFileKey: true,
      chapter: {
        select: {
          title: true,
          course: {
            select: { title: true, slug: true },
          },
        },
      },
    },
  });

  if (!lesson) return null;

  const contentHtml = tiptapJsonToHtml(lesson.content);

  let videoUrl: string | null = null;
  if (lesson.videoFileKey) {
    const command = new GetObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: lesson.videoFileKey,
    });
    videoUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
  }

  return { ...lesson, contentHtml, videoUrl };
}

export type LessonPreviewType = NonNullable<
  Awaited<ReturnType<typeof publicGetLessonPreview>>
>;

