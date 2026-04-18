import "server-only";

import { prisma } from "@/lib/db";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { env } from "@/lib/env";
import { tiptapJsonToHtml } from "@/lib/tiptap-html";

export default async function publicGetLessonPreview(
  lessonId: string,
  userId?: string | null
) {
  if (!lessonId || !lessonId.trim()) return null;

  // First, fetch lesson with course info (regardless of access)
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
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
      isFreePreview: true,
      chapter: {
        select: {
          title: true,
          course: {
            select: { id: true, title: true, slug: true, price: true },
          },
        },
      },
    },
  });

  if (!lesson) return null;

  // Check access: free preview OR active enrollment
  let hasAccess = lesson.isFreePreview;

  if (!hasAccess && userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.chapter.course.id,
        },
      },
      select: { status: true },
    });
    hasAccess = enrollment?.status === "Active";
  }

  if (!hasAccess) {
    // Return restricted: title only, no content/video
    return {
      id: lesson.id,
      title: lesson.title,
      content: null,
      videoFileKey: null,
      isFreePreview: lesson.isFreePreview,
      chapter: lesson.chapter,
      contentHtml: null,
      videoUrl: null,
      restricted: true as const,
    };
  }

  const contentHtml = tiptapJsonToHtml(lesson.content);

  let videoUrl: string | null = null;
  if (lesson.videoFileKey) {
    const command = new GetObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: lesson.videoFileKey,
    });
    videoUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
  }

  return {
    ...lesson,
    contentHtml,
    videoUrl,
    restricted: false as const,
  };
}

export type LessonPreviewType = NonNullable<
  Awaited<ReturnType<typeof publicGetLessonPreview>>
>;

