import "server-only";

import { prisma } from "@/lib/db";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { env } from "@/lib/env";
import { COURSES_PAGE_SIZE, courseLevels, courseCategories } from "@/lib/zodSchema";
import type { Prisma, CourseLevel } from "@prisma/client";

export default async function publicGetCourses(params?: {
  search?: string;
  level?: string;
  category?: string;
  page?: number;
}) {
  const where: Prisma.CourseWhereInput = {
    isPublished: true,
    status: "Published",
  };

  if (params?.search) {
    const trimmed = params.search.trim().slice(0, 100);
    if (trimmed) {
      where.title = { contains: trimmed, mode: "insensitive" };
    }
  }

  if (params?.level && (courseLevels as readonly string[]).includes(params.level)) {
    where.level = params.level as CourseLevel;
  }

  if (params?.category && (courseCategories as readonly string[]).includes(params.category)) {
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
        price: true,
        fileKey: true,
        category: true,
        slug: true,
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
      return { ...course, imageUrl };
    }),
  );

  const totalPages = Math.ceil(totalCount / COURSES_PAGE_SIZE);

  return { courses: data, totalCount, totalPages, currentPage };
}

export type PublicCourseType = Awaited<
  ReturnType<typeof publicGetCourses>
>["courses"][0];

