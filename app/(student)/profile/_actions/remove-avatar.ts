"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { tryCatch } from "@/hooks/try-catch";
import arcjetClient, { slidingWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { env } from "@/lib/env";
import type { ApiResponse } from "@/lib/types";

export async function removeAvatar(): Promise<ApiResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { status: "error", message: "Authentication required" };
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

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  // Delete S3 object if exists
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
      console.error(
        "[removeAvatar] Failed to delete S3 object:",
        deleteError,
      );
    }
  }

  const { error } = await tryCatch(
    prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    }),
  );

  if (error) {
    console.error("[removeAvatar] Failed to remove avatar:", error);
    return { status: "error", message: "Failed to remove avatar" };
  }

  revalidatePath("/profile");
  return { status: "success", message: "Avatar removed successfully" };
}

