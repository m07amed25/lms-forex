import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { tryCatch } from "@/hooks/try-catch";
import arcjetClient, { slidingWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import type { TimeSeriesDataPoint } from "@/lib/types/analytics";

export async function adminGetEnrollmentTimeseries(): Promise<
  TimeSeriesDataPoint[]
> {
  const admin = await requireAdmin();

  const aj = arcjetClient.withRule(
    slidingWindow({ mode: "LIVE", interval: "1m", max: 60 })
  );
  const req = await request();
  const decision = await aj.protect(req, { fingerprint: admin.id });
  if (decision.isDenied()) {
    throw new Error("Too many requests. Please wait.");
  }

  const ninetyDaysAgo = new Date(
    Date.now() - 90 * 24 * 60 * 60 * 1000
  );

  const { data: rawData, error } = await tryCatch(
    prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT
        date_trunc('day', "createdAt")::date as date,
        COUNT(*)::bigint as count
      FROM enrollment
      WHERE "createdAt" >= ${ninetyDaysAgo}
      GROUP BY date_trunc('day', "createdAt")
      ORDER BY date ASC
    `
  );

  if (error) throw new Error("Failed to fetch enrollment timeseries");

  // Build a map of existing data
  const dataMap = new Map<string, number>();
  for (const row of rawData) {
    const dateStr = new Date(row.date).toISOString().split("T")[0];
    dataMap.set(dateStr, Number(row.count));
  }

  // Fill gaps for all 90 days
  const result: TimeSeriesDataPoint[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      value: dataMap.get(dateStr) ?? 0,
    });
  }

  return result;
}


