import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { env } from "@/lib/env";

export default async function adminGetCourse(courseId: string) {
  await requireAdmin();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
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

  return { ...course, imageUrl };
}

export type AdminCourseDetailType = NonNullable<
  Awaited<ReturnType<typeof adminGetCourse>>
>;


