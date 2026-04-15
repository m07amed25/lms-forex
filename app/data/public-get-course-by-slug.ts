import "server-only";

import { prisma } from "@/lib/db";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { env } from "@/lib/env";
import { tiptapJsonToHtml } from "@/lib/tiptap-html";

export default async function publicGetCourseBySlug(slug: string) {
  const course = await prisma.course.findUnique({
    where: {
      slug,
      isPublished: true,
      status: "Published",
    },
    include: {
      chapters: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              position: true,
              isFreePreview: true,
            },
          },
        },
      },
    },
  });

  if (!course) return null;

  let imageUrl = "";
  if (course.fileKey) {
    const command = new GetObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: course.fileKey,
    });
    imageUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
  }

  const descriptionHtml = tiptapJsonToHtml(course.description);

  return { ...course, imageUrl, descriptionHtml };
}

export type PublicCourseDetailType = NonNullable<
  Awaited<ReturnType<typeof publicGetCourseBySlug>>
>;

