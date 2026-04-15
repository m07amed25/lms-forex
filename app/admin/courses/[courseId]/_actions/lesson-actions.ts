"use server";

import { prisma } from "@/lib/db";
import {
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
} from "@/lib/zodSchema";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { z } from "zod";
import { env } from "@/lib/env";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    }),
  );

// ─── Internal Helper: S3 Cleanup ────────────────────────────
async function cleanupS3Object(fileKey: string): Promise<void> {
  try {
    await fetch(`${env.BETTER_AUTH_URL}/api/s3/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: fileKey }),
    });
  } catch (error) {
    console.error("[S3 Cleanup Failed]:", fileKey, error);
  }
}

// ─── createLesson ───────────────────────────────────────────
export async function createLesson(
  data: z.infer<typeof createLessonSchema>,
): Promise<ApiResponse> {
  const admin = await requireAdmin();

  if (!admin) {
    return { status: "error", message: "Unauthorized" };
  }

  try {
    const req = await request();
    const decision = await aj.protect(req, { fingerprint: admin.id });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "Too many requests. Please try again in a minute.",
        };
      }
      return {
        status: "error",
        message: "Access denied. Security rule triggered.",
      };
    }

    const validation = createLessonSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg = validation.error.issues
        .map((e) => e.message)
        .join(", ");
      return { status: "error", message: `Validation failed: ${errorMsg}` };
    }

    const { title, content, chapterId, isFreePreview, videoFileKey } =
      validation.data;

    // Verify chapter exists and get courseId
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, courseId: true },
    });

    if (!chapter) {
      return { status: "error", message: "Chapter not found" };
    }

    // Compute position (append to end)
    const count = await prisma.lesson.count({ where: { chapterId } });

    await prisma.lesson.create({
      data: {
        title,
        content,
        position: count,
        chapterId,
        isFreePreview,
        videoFileKey: videoFileKey ?? null,
      },
    });

    revalidatePath(`/admin/courses/${chapter.courseId}`);

    return { status: "success", message: "Lesson created successfully" };
  } catch (error) {
    console.error("[CreateLesson Error]:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        status: "error",
        message: `Database error (${error.code}): ${error.message}`,
      };
    }

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while creating the lesson",
    };
  }
}

// ─── updateLesson ───────────────────────────────────────────
export async function updateLesson(
  data: z.infer<typeof updateLessonSchema>,
): Promise<ApiResponse> {
  const admin = await requireAdmin();

  if (!admin) {
    return { status: "error", message: "Unauthorized" };
  }

  try {
    const req = await request();
    const decision = await aj.protect(req, { fingerprint: admin.id });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "Too many requests. Please try again in a minute.",
        };
      }
      return {
        status: "error",
        message: "Access denied. Security rule triggered.",
      };
    }

    const validation = updateLessonSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg = validation.error.issues
        .map((e) => e.message)
        .join(", ");
      return { status: "error", message: `Validation failed: ${errorMsg}` };
    }

    const { lessonId, title, content, isFreePreview, videoFileKey } =
      validation.data;

    // Fetch existing lesson to compare videoFileKey
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { videoFileKey: true, chapter: { select: { courseId: true } } },
    });

    if (!existingLesson) {
      return { status: "error", message: "Lesson not found" };
    }

    // If videoFileKey changed and old key exists, clean up S3
    if (
      existingLesson.videoFileKey &&
      existingLesson.videoFileKey !== videoFileKey
    ) {
      cleanupS3Object(existingLesson.videoFileKey).catch((err) =>
        console.error("[S3 Old Video Cleanup Error]:", err),
      );
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        content,
        isFreePreview,
        videoFileKey: videoFileKey ?? null,
      },
    });

    revalidatePath(
      `/admin/courses/${existingLesson.chapter.courseId}`,
    );
    revalidatePath(
      `/admin/courses/${existingLesson.chapter.courseId}/lessons/${lessonId}`,
    );

    return { status: "success", message: "Lesson updated successfully" };
  } catch (error) {
    console.error("[UpdateLesson Error]:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { status: "error", message: "Lesson not found" };
      }
      return {
        status: "error",
        message: `Database error (${error.code}): ${error.message}`,
      };
    }

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while updating the lesson",
    };
  }
}

// ─── deleteLesson ───────────────────────────────────────────
export async function deleteLesson(
  lessonId: string,
): Promise<ApiResponse> {
  const admin = await requireAdmin();

  if (!admin) {
    return { status: "error", message: "Unauthorized" };
  }

  try {
    const req = await request();
    const decision = await aj.protect(req, { fingerprint: admin.id });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "Too many requests. Please try again in a minute.",
        };
      }
      return {
        status: "error",
        message: "Access denied. Security rule triggered.",
      };
    }

    const uuidResult = z.string().uuid().safeParse(lessonId);
    if (!uuidResult.success) {
      return { status: "error", message: "Invalid lesson ID" };
    }

    // Fetch lesson with chapter info and videoFileKey
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        chapterId: true,
        videoFileKey: true,
        chapter: { select: { courseId: true } },
      },
    });

    if (!lesson) {
      return { status: "error", message: "Lesson not found" };
    }

    // S3 cleanup if video exists
    if (lesson.videoFileKey) {
      cleanupS3Object(lesson.videoFileKey).catch((err) =>
        console.error("[S3 Video Cleanup Error]:", err),
      );
    }

    // Delete lesson
    await prisma.lesson.delete({ where: { id: lessonId } });

    // Re-calculate positions for remaining lessons
    const remainingLessons = await prisma.lesson.findMany({
      where: { chapterId: lesson.chapterId },
      orderBy: { position: "asc" },
      select: { id: true },
    });

    if (remainingLessons.length > 0) {
      await prisma.$transaction(
        remainingLessons.map((l, index) =>
          prisma.lesson.update({
            where: { id: l.id },
            data: { position: -(index + 1) },
          }),
        ),
      );
      await prisma.$transaction(
        remainingLessons.map((l, index) =>
          prisma.lesson.update({
            where: { id: l.id },
            data: { position: index },
          }),
        ),
      );
    }

    revalidatePath(`/admin/courses/${lesson.chapter.courseId}`);

    return { status: "success", message: "Lesson deleted successfully" };
  } catch (error) {
    console.error("[DeleteLesson Error]:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { status: "error", message: "Lesson not found" };
      }
      return {
        status: "error",
        message: `Database error (${error.code}): ${error.message}`,
      };
    }

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the lesson",
    };
  }
}

// ─── reorderLessons ─────────────────────────────────────────
export async function reorderLessons(
  data: z.infer<typeof reorderLessonsSchema>,
): Promise<ApiResponse> {
  const admin = await requireAdmin();

  if (!admin) {
    return { status: "error", message: "Unauthorized" };
  }

  try {
    const req = await request();
    const decision = await aj.protect(req, { fingerprint: admin.id });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "Too many requests. Please try again in a minute.",
        };
      }
      return {
        status: "error",
        message: "Access denied. Security rule triggered.",
      };
    }

    const validation = reorderLessonsSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg = validation.error.issues
        .map((e) => e.message)
        .join(", ");
      return { status: "error", message: `Validation failed: ${errorMsg}` };
    }

    const { chapterId, items } = validation.data;

    // Get courseId for revalidation
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { courseId: true },
    });

    if (!chapter) {
      return { status: "error", message: "Chapter not found" };
    }

    // Verify count matches
    const actualCount = await prisma.lesson.count({ where: { chapterId } });
    if (items.length !== actualCount) {
      return { status: "error", message: "Item count mismatch" };
    }

    // Temporarily set all positions to negative values
    await prisma.$transaction(
      items.map(({ id }, index) =>
        prisma.lesson.update({
          where: { id },
          data: { position: -(index + 1) },
        }),
      ),
    );

    // Set final positions
    await prisma.$transaction(
      items.map(({ id, position }) =>
        prisma.lesson.update({
          where: { id },
          data: { position },
        }),
      ),
    );

    revalidatePath(`/admin/courses/${chapter.courseId}`);

    return { status: "success", message: "Lessons reordered successfully" };
  } catch (error) {
    console.error("[ReorderLessons Error]:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        status: "error",
        message: `Database error (${error.code}): ${error.message}`,
      };
    }

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while reordering lessons",
    };
  }
}

