"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { updateAvatarSchema } from "@/lib/zodSchema";
import { tryCatch } from "@/hooks/try-catch";
import arcjetClient, { slidingWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { env } from "@/lib/env";
import type { ApiResponse } from "@/lib/types";

export async function updateAvatar(
  input: unknown,
): Promise<ApiResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { status: "error", message: "Authentication required" };
  }

  const parsed = updateAvatarSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    return { status: "error", message: firstError };
  }

  // Rate limit: 5 requests / 60s per user
  const aj = arcjetClient.withRule(
    slidingWindow({ mode: "LIVE", interval: "1m", max: 5 }),
  );
  const req = await request();
  const decision = await aj.protect(req, {
    fingerprint: session.user.id,
  });
  if (decision.isDenied()) {
    return { status: "error", message: "Too many requests. Please wait." };
  }

  // Get current user image to delete old S3 object
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  // Delete old S3 object if exists
  if (currentUser?.image) {
    const { error: deleteError } = await tryCatch(
      S3.send(
        new DeleteObjectCommand({
          Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
          Key: currentUser.image,
        }),
      ),
    );
    if (deleteError) {
      console.error("[updateAvatar] Failed to delete old avatar:", deleteError);
    }
  }

  const { error } = await tryCatch(
    prisma.user.update({
      where: { id: session.user.id },
      data: { image: parsed.data.imageFileKey },
    }),
  );

  if (error) {
    console.error("[updateAvatar] Failed to update avatar:", error);
    return { status: "error", message: "Failed to update avatar" };
  }

  revalidatePath("/profile");
  return { status: "success", message: "Avatar updated successfully" };
}


