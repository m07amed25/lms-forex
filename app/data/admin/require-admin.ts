import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
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

    console.warn(
      `[requireAdmin] User ${session.user.id} attempted admin access with role: ${session.user.role}`,
    );
    redirect("/unauthorized");
  }

  return admin;
}
