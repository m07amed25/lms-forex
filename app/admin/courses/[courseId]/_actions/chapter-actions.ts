"use server";

import { prisma } from "@/lib/db";
import {
  createChapterSchema,
  updateChapterSchema,
  reorderChaptersSchema,
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

// ─── createChapter ──────────────────────────────────────────
export async function createChapter(
  data: z.infer<typeof createChapterSchema>,
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

    const validation = createChapterSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg = validation.error.issues
        .map((e) => e.message)
        .join(", ");
      return { status: "error", message: `Validation failed: ${errorMsg}` };
    }

    const { title, courseId } = validation.data;

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return { status: "error", message: "Course not found" };
    }

    // Compute position (append to end)
    const count = await prisma.chapter.count({ where: { courseId } });

    await prisma.chapter.create({
      data: { title, position: count, courseId },
    });

    revalidatePath(`/admin/courses/${courseId}`);

    return { status: "success", message: "Chapter created successfully" };
  } catch (error) {
    console.error("[CreateChapter Error]:", error);

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
          : "An unexpected error occurred while creating the chapter",
    };
  }
}

// ─── updateChapter ──────────────────────────────────────────
export async function updateChapter(
  data: z.infer<typeof updateChapterSchema>,
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

    const validation = updateChapterSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg = validation.error.issues
        .map((e) => e.message)
        .join(", ");
      return { status: "error", message: `Validation failed: ${errorMsg}` };
    }

    const { chapterId, title } = validation.data;

    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: { title },
      select: { courseId: true },
    });

    revalidatePath(`/admin/courses/${chapter.courseId}`);

    return { status: "success", message: "Chapter updated successfully" };
  } catch (error) {
    console.error("[UpdateChapter Error]:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { status: "error", message: "Chapter not found" };
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
          : "An unexpected error occurred while updating the chapter",
    };
  }
}

// ─── deleteChapter ──────────────────────────────────────────
export async function deleteChapter(
  chapterId: string,
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

    const uuidResult = z.string().uuid().safeParse(chapterId);
    if (!uuidResult.success) {
      return { status: "error", message: "Invalid chapter ID" };
    }

    // Fetch chapter with courseId
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { courseId: true, position: true },
    });

    if (!chapter) {
      return { status: "error", message: "Chapter not found" };
    }

    // Fetch lessons with video keys for S3 cleanup
    const lessons = await prisma.lesson.findMany({
      where: { chapterId },
      select: { videoFileKey: true },
    });

    const videoKeys = lessons
      .map((l) => l.videoFileKey)
      .filter((key): key is string => key !== null);

    // Fire-and-forget S3 deletes
    await Promise.allSettled(videoKeys.map((key) => cleanupS3Object(key)));

    // Delete chapter (cascades lessons in DB)
    await prisma.chapter.delete({ where: { id: chapterId } });

    // Re-calculate positions for remaining chapters
    const remainingChapters = await prisma.chapter.findMany({
      where: { courseId: chapter.courseId },
      orderBy: { position: "asc" },
      select: { id: true },
    });

    if (remainingChapters.length > 0) {
      await prisma.$transaction(
        remainingChapters.map((ch, index) =>
          prisma.chapter.update({
            where: { id: ch.id },
            data: { position: -(index + 1) },
          }),
        ),
      );
      await prisma.$transaction(
        remainingChapters.map((ch, index) =>
          prisma.chapter.update({
            where: { id: ch.id },
            data: { position: index },
          }),
        ),
      );
    }

    revalidatePath(`/admin/courses/${chapter.courseId}`);

    return { status: "success", message: "Chapter deleted successfully" };
  } catch (error) {
    console.error("[DeleteChapter Error]:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { status: "error", message: "Chapter not found" };
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
          : "An unexpected error occurred while deleting the chapter",
    };
  }
}

// ─── reorderChapters ────────────────────────────────────────
export async function reorderChapters(
  data: z.infer<typeof reorderChaptersSchema>,
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

    const validation = reorderChaptersSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg = validation.error.issues
        .map((e) => e.message)
        .join(", ");
      return { status: "error", message: `Validation failed: ${errorMsg}` };
    }

    const { courseId, items } = validation.data;

    // Verify count matches
    const actualCount = await prisma.chapter.count({ where: { courseId } });
    if (items.length !== actualCount) {
      return { status: "error", message: "Item count mismatch" };
    }

    // Temporarily set all positions to negative values (avoid unique constraint conflicts)
    await prisma.$transaction(
      items.map(({ id }, index) =>
        prisma.chapter.update({
          where: { id },
          data: { position: -(index + 1) },
        }),
      ),
    );

    // Set final positions
    await prisma.$transaction(
      items.map(({ id, position }) =>
        prisma.chapter.update({
          where: { id },
          data: { position },
        }),
      ),
    );

    revalidatePath(`/admin/courses/${courseId}`);

    return { status: "success", message: "Chapters reordered successfully" };
  } catch (error) {
    console.error("[ReorderChapters Error]:", error);

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
          : "An unexpected error occurred while reordering chapters",
    };
  }
}

