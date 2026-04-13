import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { env } from "@/lib/env";

export async function adminGetCourses() {
  await requireAdmin();

  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      fileKey: true,
      category: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const data = await Promise.all(
    courses.map(async (course) => {
      let imageUrl = "";
      if (course.fileKey) {
        const command = new GetObjectCommand({
          Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
          Key: course.fileKey,
        });
        imageUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
      }

      return {
        ...course,
        imageUrl,
      };
    }),
  );

  return data;
}