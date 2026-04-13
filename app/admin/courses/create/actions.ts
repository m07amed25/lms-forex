"use server";

import { prisma } from "@/lib/db";
import { createCourseSchema, CreateCourseSchema } from "@/lib/zodSchema";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import ip from "@arcjet/ip";

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

export async function createCourse(
  data: CreateCourseSchema,
): Promise<ApiResponse> {
  const admin = await requireAdmin();

  if (!admin) {
    return {
      status: "error",
      message: "Unauthorized",
    };
  }

  try {
    // Access request data that Arcjet needs when you call `protect()` similarly
    // to `await headers()` and `await cookies()` in `next/headers`
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

    const validation = createCourseSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => e.message).join(", ");
      return {
        status: "error",
        message: `Validation failed: ${errorMsg}`,
      };
    }

    const { status, duration, ...rest } = validation.data;

    await prisma.course.create({
      data: {
        ...rest,
        status: status,
        isPublished: status === "Published",
        duration: Number(duration),
        userId: admin.id,
      },
    });

    revalidatePath("/admin/courses");

    return {
      status: "success",
      message: "Course created successfully",
    };
  } catch (error) {
    console.error("[CreateCourse Error]:", error);

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
          : "An unexpected error occurred while creating the course",
    };
  }
}
