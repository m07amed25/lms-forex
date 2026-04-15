import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { env } from "@/lib/env";
import { COURSES_PAGE_SIZE } from "@/lib/zodSchema";
import { Prisma, CourseLevel, CourseStatus } from "@prisma/client";

export default async function adminGetCourses(params?: {
  search?: string;
  status?: string;
  level?: string;
  category?: string;
  page?: number;
}) {
  await requireAdmin();

  const where: Prisma.CourseWhereInput = {};

  if (params?.search) {
    where.title = { contains: params.search, mode: "insensitive" };
  }
  if (params?.status) {
    where.status = params.status as CourseStatus;
  }
  if (params?.level) {
    where.level = params.level as CourseLevel;
  }
  if (params?.category) {
    where.category = params.category;
  }

  const currentPage = Math.max(1, params?.page ?? 1);

  const [courses, totalCount] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * COURSES_PAGE_SIZE,
      take: COURSES_PAGE_SIZE,
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
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.course.count({ where }),
  ]);

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

  const totalPages = Math.ceil(totalCount / COURSES_PAGE_SIZE);

  return { courses: data, totalCount, totalPages, currentPage };
}

export type AdminCourseType = Awaited<
  ReturnType<typeof adminGetCourses>
>["courses"][0];
