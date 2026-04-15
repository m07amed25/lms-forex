"use server";

import { prisma } from "@/lib/db";
import { updateCourseSchema, UpdateCourseSchema } from "@/lib/zodSchema";
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
async function cleanupS3Thumbnail(fileKey: string): Promise<void> {
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

// ─── updateCourse ────────────────────────────────────────────
export async function updateCourse(
  data: UpdateCourseSchema,
): Promise<ApiResponse> {
  const admin = await requireAdmin();

  if (!admin) {
    return { status: "error", message: "Unauthorized" };
  }

  try {
    const req = await request();

    const decision = await aj.protect(req, {
      fingerprint: admin.id,
    });

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

    const validation = updateCourseSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg = validation.error.issues
        .map((e) => e.message)
        .join(", ");
      return {
        status: "error",
        message: `Validation failed: ${errorMsg}`,
      };
    }

    const { courseId, status, duration, ...rest } = validation.data;

    // Fetch existing course to compare fileKey for thumbnail replacement
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: { fileKey: true },
    });

    if (!existingCourse) {
      return { status: "error", message: "Course not found" };
    }

    await prisma.course.update({
      where: { id: courseId },
      data: {
        ...rest,
        status: status,
        isPublished: status === "Published",
        duration: Number(duration),
      },
    });

    // If fileKey changed, clean up old S3 thumbnail (fire-and-forget)
    if (existingCourse.fileKey !== rest.fileKey) {
      cleanupS3Thumbnail(existingCourse.fileKey).catch((err) =>
        console.error("[S3 Old Thumbnail Cleanup Error]:", err),
      );
    }

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);

    return { status: "success", message: "Course updated successfully" };
  } catch (error) {
    console.error("[UpdateCourse Error]:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          status: "error",
          message: "A course with this slug already exists",
        };
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
          : "An unexpected error occurred while updating the course",
    };
  }
}

// ─── deleteCourse ────────────────────────────────────────────
export async function deleteCourse(courseId: string): Promise<ApiResponse> {
  const admin = await requireAdmin();

  if (!admin) {
    return { status: "error", message: "Unauthorized" };
  }

  try {
    const req = await request();

    const decision = await aj.protect(req, {
      fingerprint: admin.id,
    });

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

    // Validate courseId format
    const uuidResult = z.string().uuid().safeParse(courseId);
    if (!uuidResult.success) {
      return { status: "error", message: "Invalid course ID" };
    }

    // Fetch course to get fileKey for S3 cleanup
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        fileKey: true,
        chapters: {
          select: {
            lessons: {
              where: { videoFileKey: { not: null } },
              select: { videoFileKey: true },
            },
          },
        },
      },
    });

    if (!course) {
      return { status: "error", message: "Course not found" };
    }

    // Collect all S3 keys for cleanup: course thumbnail + lesson videos
    const s3Keys: string[] = [];
    if (course.fileKey) {
      s3Keys.push(course.fileKey);
    }
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.videoFileKey) {
          s3Keys.push(lesson.videoFileKey);
        }
      }
    }

    // Delete course record first (cascades chapters + lessons in DB)
    await prisma.course.delete({
      where: { id: courseId },
    });

    // Clean up all S3 objects (fire-and-forget)
    if (s3Keys.length > 0) {
      Promise.allSettled(
        s3Keys.map((key) => cleanupS3Thumbnail(key)),
      ).catch((err) =>
        console.error("[S3 Cascade Cleanup Error]:", err),
      );
    }

    revalidatePath("/admin/courses");

    return { status: "success", message: "Course deleted successfully" };
  } catch (error) {
    console.error("[DeleteCourse Error]:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { status: "error", message: "Course not found" };
      }
      return {
        status: "error",
        message: "Failed to delete course",
      };
    }

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the course",
    };
  }
}

// ─── togglePublish ────────────────────────────────────────────
export async function togglePublish(courseId: string): Promise<ApiResponse> {
  const admin = await requireAdmin();

  if (!admin) {
    return { status: "error", message: "Unauthorized" };
  }

  try {
    const req = await request();

    const decision = await aj.protect(req, {
      fingerprint: admin.id,
    });

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

    // Validate courseId format
    const uuidResult = z.string().uuid().safeParse(courseId);
    if (!uuidResult.success) {
      return { status: "error", message: "Invalid course ID" };
    }

    // Fetch current course state
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { status: true, isPublished: true },
    });

    if (!course) {
      return { status: "error", message: "Course not found" };
    }

    // Determine new state:
    // Published → Draft (unpublish)
    // Draft or Archived → Published (publish)
    const isCurrentlyPublished = course.status === "Published";
    const newStatus = isCurrentlyPublished ? "Draft" : "Published";
    const newIsPublished = !isCurrentlyPublished;

    await prisma.course.update({
      where: { id: courseId },
      data: {
        status: newStatus,
        isPublished: newIsPublished,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);

    return {
      status: "success",
      message: isCurrentlyPublished
        ? "Course unpublished successfully"
        : "Course published successfully",
    };
  } catch (error) {
    console.error("[TogglePublish Error]:", error);

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while toggling publish state",
    };
  }
}

