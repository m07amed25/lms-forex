"use server";

import { prisma } from "@/lib/db";
import { createCourseSchema, CreateCourseSchema } from "@/lib/zodSchema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function createCourse(
  data: CreateCourseSchema,
): Promise<ApiResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      status: "error",
      message: "Unauthorized",
    };
  }

  try {
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
        duration: Number(duration), // Ensure this is a number (DB expects Float)
        userId: session.user.id,
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
