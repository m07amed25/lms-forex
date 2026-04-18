"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { enrollInCourseSchema } from "@/lib/zodSchema";
import type { ApiResponse } from "@/lib/types";
import arcjetClient, { slidingWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";

export async function enrollInCourse(courseId: string): Promise<ApiResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { status: "error", message: "Authentication required" };
  }

  const parsed = enrollInCourseSchema.safeParse({ courseId });
  if (!parsed.success) {
    return { status: "error", message: "Invalid course ID" };
  }

  // Rate limit: 10 requests / 60s per user
  const aj = arcjetClient.withRule(
    slidingWindow({ mode: "LIVE", interval: "1m", max: 10 })
  );
  const req = await request();
  const decision = await aj.protect(req, {
    fingerprint: session.user.id,
  });
  if (decision.isDenied()) {
    return { status: "error", message: "Too many requests. Please wait." };
  }

  const course = await prisma.course.findUnique({
    where: { id: parsed.data.courseId, isPublished: true, status: "Published" },
    select: { id: true, price: true, slug: true },
  });

  if (!course) {
    return { status: "error", message: "Course not available" };
  }

  if (course.price > 0) {
    return { status: "error", message: "This course requires payment" };
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });

  if (existing) {
    return { status: "error", message: "Already enrolled in this course" };
  }

  await prisma.enrollment.create({
    data: {
      userId: session.user.id,
      courseId: course.id,
      status: "Active",
    },
  });

  console.log(
    JSON.stringify({
      event: "enrollment_created",
      userId: session.user.id,
      courseId: course.id,
      status: "Active",
      type: "free",
    })
  );

  revalidatePath(`/courses/${course.slug}`);

  return { status: "success", message: "Successfully enrolled in the course" };
}



