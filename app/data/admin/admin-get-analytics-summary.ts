import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { tryCatch } from "@/hooks/try-catch";
import arcjetClient, { slidingWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import type { AnalyticsSummary } from "@/lib/types/analytics";

export async function adminGetAnalyticsSummary(): Promise<AnalyticsSummary> {
  const admin = await requireAdmin();

  // Rate limit: 60 req / 60s per user
  const aj = arcjetClient.withRule(
    slidingWindow({ mode: "LIVE", interval: "1m", max: 60 })
  );
  const req = await request();
  const decision = await aj.protect(req, { fingerprint: admin.id });
  if (decision.isDenied()) {
    throw new Error("Too many requests. Please wait.");
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // --- Total Revenue ---
  const { data: revenueResult, error: revenueError } = await tryCatch(
    prisma.order.aggregate({
      _sum: { amountCents: true },
      where: { status: "Completed" },
    })
  );
  if (revenueError) throw new Error("Failed to fetch revenue data");
  const totalRevenueCents = revenueResult._sum.amountCents ?? 0;

  // --- Total Students ---
  const { data: totalStudentsResult, error: studentsError } = await tryCatch(
    prisma.user.count({
      where: { OR: [{ role: { not: "admin" } }, { role: null }] },
    })
  );
  if (studentsError) throw new Error("Failed to fetch student count");
  const totalStudents = totalStudentsResult;

  // --- Active Students (with UserProgress.completedAt in last 30 days) ---
  const { data: activeStudentsResult, error: activeError } = await tryCatch(
    prisma.userProgress.findMany({
      where: { completedAt: { gte: thirtyDaysAgo } },
      select: { userId: true },
      distinct: ["userId"],
    })
  );
  if (activeError) throw new Error("Failed to fetch active students");
  const activeStudents = activeStudentsResult.length;

  // --- Completion Rate ---
  // For each Active enrollment, check if the user completed ALL lessons in the course
  const { data: completionData, error: completionError } = await tryCatch(
    prisma.$queryRaw<{ completion_rate: number }[]>`
      SELECT
        CASE WHEN COUNT(*) = 0 THEN 0
        ELSE (
          COUNT(CASE WHEN completed_lessons = total_lessons THEN 1 END)::float
          / COUNT(*)::float * 100
        )
        END as completion_rate
      FROM (
        SELECT
          e.id as enrollment_id,
          e."userId",
          e."courseId",
          (
            SELECT COUNT(*)::int FROM lesson l
            JOIN chapter c ON l."chapterId" = c.id
            WHERE c."courseId" = e."courseId"
          ) as total_lessons,
          (
            SELECT COUNT(*)::int FROM user_progress up
            JOIN lesson l ON up."lessonId" = l.id
            JOIN chapter c ON l."chapterId" = c.id
            WHERE c."courseId" = e."courseId" AND up."userId" = e."userId"
          ) as completed_lessons
        FROM enrollment e
        WHERE e.status = 'Active'
      ) sub
      WHERE total_lessons > 0
    `
  );
  if (completionError) throw new Error("Failed to calculate completion rate");
  const completionRate = Number(completionData[0]?.completion_rate ?? 0);

  // --- Trends: compare current 30-day vs previous 30-day ---

  // Revenue trends
  const [currentRevenue, previousRevenue] = await Promise.all([
    prisma.order.aggregate({
      _sum: { amountCents: true },
      where: { status: "Completed", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.order.aggregate({
      _sum: { amountCents: true },
      where: {
        status: "Completed",
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
  ]);
  const curRev = currentRevenue._sum.amountCents ?? 0;
  const prevRev = previousRevenue._sum.amountCents ?? 0;

  // Student trends (new registrations)
  const [currentStudents, previousStudents] = await Promise.all([
    prisma.user.count({
      where: {
        OR: [{ role: { not: "admin" } }, { role: null }],
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.user.count({
      where: {
        OR: [{ role: { not: "admin" } }, { role: null }],
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
  ]);

  // Active student trends
  const previousActiveStudents = await prisma.userProgress.findMany({
    where: {
      completedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
    },
    select: { userId: true },
    distinct: ["userId"],
  });

  // Previous completion rate
  const previousCompletionData = await prisma.$queryRaw<
    { completion_rate: number }[]
  >`
    SELECT
      CASE WHEN COUNT(*) = 0 THEN 0
      ELSE (
        COUNT(CASE WHEN completed_lessons = total_lessons THEN 1 END)::float
        / COUNT(*)::float * 100
      )
      END as completion_rate
    FROM (
      SELECT
        e.id as enrollment_id,
        e."userId",
        e."courseId",
        (
          SELECT COUNT(*)::int FROM lesson l
          JOIN chapter c ON l."chapterId" = c.id
          WHERE c."courseId" = e."courseId"
        ) as total_lessons,
        (
          SELECT COUNT(*)::int FROM user_progress up
          JOIN lesson l ON up."lessonId" = l.id
          JOIN chapter c ON l."chapterId" = c.id
          WHERE c."courseId" = e."courseId" AND up."userId" = e."userId"
          AND up."completedAt" < ${thirtyDaysAgo}
        ) as completed_lessons
      FROM enrollment e
      WHERE e.status = 'Active'
      AND e."createdAt" < ${thirtyDaysAgo}
    ) sub
    WHERE total_lessons > 0
  `;
  const prevCompletionRate = Number(
    previousCompletionData[0]?.completion_rate ?? 0
  );

  function calcTrend(current: number, previous: number): number {
    if (previous === 0 && current > 0) return 100;
    if (previous === 0 && current === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  return {
    totalRevenueCents,
    totalStudents,
    activeStudents,
    completionRate: Math.round(completionRate * 100) / 100,
    trends: {
      revenue: calcTrend(curRev, prevRev),
      students: calcTrend(currentStudents, previousStudents),
      activeStudents: calcTrend(
        activeStudents,
        previousActiveStudents.length
      ),
      completionRate:
        Math.round((completionRate - prevCompletionRate) * 100) / 100,
    },
  };
}



