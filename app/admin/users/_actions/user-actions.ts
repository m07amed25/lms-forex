"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const banUserSchema = z.object({
  userId: z.string().min(1),
  banReason: z.string().max(500).optional(),
});

const unbanUserSchema = z.object({
  userId: z.string().min(1),
});

const changeRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "user"]),
});

export async function banUser(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = banUserSchema.safeParse({
    userId: formData.get("userId"),
    banReason: formData.get("banReason") || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const { userId, banReason } = parsed.data;

  // Prevent self-ban
  if (userId === admin.id) {
    return { error: "You cannot ban yourself" };
  }

  // Verify user exists & isn't already banned
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, banned: true, role: true },
  });

  if (!user) {
    return { error: "User not found" };
  }

  if (user.banned) {
    return { error: "User is already banned" };
  }

  // Use Better Auth admin API to ban the user
  await auth.api.banUser({
    headers: await headers(),
    body: {
      userId,
      banReason: banReason || "Banned by administrator",
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return { success: true };
}

export async function unbanUser(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = unbanUserSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const { userId } = parsed.data;

  // Verify user exists & is banned
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, banned: true },
  });

  if (!user) {
    return { error: "User not found" };
  }

  if (!user.banned) {
    return { error: "User is not banned" };
  }

  // Use Better Auth admin API to unban the user
  await auth.api.unbanUser({
    headers: await headers(),
    body: { userId },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return { success: true };
}

export async function changeUserRole(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = changeRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const { userId, role } = parsed.data;

  // Prevent self-role change
  if (userId === admin.id) {
    return { error: "You cannot change your own role" };
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    return { error: "User not found" };
  }

  // Use Better Auth admin API to set role
  await auth.api.setRole({
    headers: await headers(),
    body: {
      userId,
      role,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return { success: true };
}

