"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { updateProfileSchema } from "@/lib/zodSchema";
import { tryCatch } from "@/hooks/try-catch";
import arcjetClient, { slidingWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/lib/types";

export async function updateProfile(
  input: unknown,
): Promise<ApiResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { status: "error", message: "Authentication required" };
  }

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    return { status: "error", message: firstError };
  }

  // Rate limit: 10 requests / 60s per user
  const aj = arcjetClient.withRule(
    slidingWindow({ mode: "LIVE", interval: "1m", max: 10 }),
  );
  const req = await request();
  const decision = await aj.protect(req, {
    fingerprint: session.user.id,
  });
  if (decision.isDenied()) {
    return { status: "error", message: "Too many requests. Please wait." };
  }

  const { name, bio } = parsed.data;

  const { error } = await tryCatch(
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio: bio || null,
      },
    }),
  );

  if (error) {
    console.error("[updateProfile] Failed to update profile:", error);
    return { status: "error", message: "Failed to update profile" };
  }

  revalidatePath("/profile");
  return { status: "success", message: "Profile updated successfully" };
}



