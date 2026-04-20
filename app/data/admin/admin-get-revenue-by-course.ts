import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { tryCatch } from "@/hooks/try-catch";
import arcjetClient, { slidingWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import type { RevenueByCourse } from "@/lib/types/analytics";

export async function adminGetRevenueByCourse(): Promise<RevenueByCourse[]> {
  const admin = await requireAdmin();

  const aj = arcjetClient.withRule(
    slidingWindow({ mode: "LIVE", interval: "1m", max: 60 })
  );
  const req = await request();
  const decision = await aj.protect(req, { fingerprint: admin.id });
  if (decision.isDenied()) {
    throw new Error("Too many requests. Please wait.");
  }

  const { data: rawData, error } = await tryCatch(
    prisma.$queryRaw<
      { course_id: string; course_title: string; revenue_cents: bigint }[]
    >`
      SELECT
        c.id as course_id,
        c.title as course_title,
        COALESCE(SUM(o."amountCents"), 0)::bigint as revenue_cents
      FROM course c
      JOIN enrollment e ON e."courseId" = c.id
      JOIN "order" o ON o."enrollmentId" = e.id
      WHERE o.status = 'Completed'
      GROUP BY c.id, c.title
      HAVING SUM(o."amountCents") > 0
      ORDER BY revenue_cents DESC
    `
  );

  if (error) throw new Error("Failed to fetch revenue by course");

  return rawData.map((row) => ({
    courseId: row.course_id,
    courseTitle: row.course_title,
    revenueCents: Number(row.revenue_cents),
  }));
}


