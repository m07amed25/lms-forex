"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revokeSessionSchema } from "@/lib/zodSchema";
import arcjetClient, { slidingWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/lib/types";

export async function revokeSession(
  input: unknown,
): Promise<ApiResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { status: "error", message: "Authentication required" };
  }

  const parsed = revokeSessionSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    return { status: "error", message: firstError };
  }

  // Guard: cannot revoke current session
  if (parsed.data.sessionId === session.session.token) {
    return { status: "error", message: "Cannot revoke your current session" };
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

  try {
    await auth.api.revokeSession({
      headers: await headers(),
      body: { token: parsed.data.sessionId },
    });
  } catch (error) {
    console.error("[revokeSession] Failed to revoke session:", error);
    return { status: "error", message: "Failed to revoke session" };
  }

  revalidatePath("/profile");
  return { status: "success", message: "Session revoked successfully" };
}



