"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/lib/types";
import arcjetClient, { slidingWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";

const markCompleteSchema = z.object({
  lessonId: z.string().uuid(),
  courseId: z.string().uuid(),
});

const progressLimiter = arcjetClient.withRule(
  slidingWindow({ mode: "LIVE", interval: 60, max: 30 }),
);

export async function markLessonComplete(
  input: z.input<typeof markCompleteSchema>,
): Promise<ApiResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { status: "error", message: "Unauthorized" };
  }

  const parsed = markCompleteSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: "Invalid input" };
  }

  const { lessonId, courseId } = parsed.data;

  // Rate limit
  const req = await request();
  const decision = await progressLimiter.protect(req, {
    fingerprint: session.user.id,
  });
  if (decision.isDenied()) {
    return {
      status: "error",
      message: "Too many requests. Please try again later.",
    };
  }

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId },
      status: "Active",
    },
  });

  if (!enrollment) {
    return { status: "error", message: "You are not enrolled in this course" };
  }

  await prisma.userProgress.upsert({
    where: {
      userId_lessonId: { userId: session.user.id, lessonId },
    },
    create: {
      userId: session.user.id,
      lessonId,
    },
    update: {},
  });

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/my-courses");

  return { status: "success", message: "Lesson marked as complete" };
}



