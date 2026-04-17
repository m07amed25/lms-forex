import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  // Check if user has admin role - adjust property access based on your auth schema
  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "admin") {
    return null;
  }

  return session.user;
}

export async function requireAdmin() {
  const admin = await getAdmin();

  if (!admin) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      redirect("/login");
    }

    const userRole = (session.user as { role?: string }).role;
    console.warn(
      `[requireAdmin] User ${session.user.id} attempted admin access with role: ${userRole}`,
    );
    redirect("/unauthorized");
  }

  return admin;
}
