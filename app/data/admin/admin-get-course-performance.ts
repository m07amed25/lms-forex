import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { tryCatch } from "@/hooks/try-catch";
import arcjetClient, { slidingWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import type { CoursePerformanceRow } from "@/lib/types/analytics";

export async function adminGetCoursePerformance(): Promise<
  CoursePerformanceRow[]
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

  const { data: courses, error } = await tryCatch(
    prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        status: true,
        chapters: {
          select: {
            lessons: {
              select: { id: true },
            },
          },
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
            status: true,
            orders: {
              where: { status: "Completed" },
              select: { amountCents: true },
            },
          },
        },
      },
    })
  );

  if (error) throw new Error("Failed to fetch course performance");

  // Get UserProgress for completion calculation
  const courseIds = courses.map((c) => c.id);
  const { data: allProgress, error: progressError } = await tryCatch(
    prisma.userProgress.findMany({
      where: {
        lesson: {
          chapter: { courseId: { in: courseIds } },
        },
      },
      select: {
        userId: true,
        lesson: {
          select: {
            chapter: {
              select: { courseId: true },
            },
          },
        },
      },
    })
  );

  if (progressError) throw new Error("Failed to fetch progress data");

  // Build user progress map: courseId -> userId -> count
  const progressMap = new Map<string, Map<string, number>>();
  for (const p of allProgress) {
    const cId = p.lesson.chapter.courseId;
    if (!progressMap.has(cId)) progressMap.set(cId, new Map());
    const userMap = progressMap.get(cId)!;
    userMap.set(p.userId, (userMap.get(p.userId) ?? 0) + 1);
  }

  const rows: CoursePerformanceRow[] = courses.map((course) => {
    const totalLessons = course.chapters.reduce(
      (sum, ch) => sum + ch.lessons.length,
      0
    );
    const enrollmentCount = course.enrollments.length;
    const revenueCents = course.enrollments.reduce(
      (sum, e) =>
        sum + e.orders.reduce((s, o) => s + o.amountCents, 0),
      0
    );

    // Completion rate: active enrollments where user completed ALL lessons
    const activeEnrollments = course.enrollments.filter(
      (e) => e.status === "Active"
    );
    let completedCount = 0;
    if (totalLessons > 0 && activeEnrollments.length > 0) {
      const userProgress = progressMap.get(course.id);
      for (const enrollment of activeEnrollments) {
        const completed = userProgress?.get(enrollment.userId) ?? 0;
        if (completed >= totalLessons) completedCount++;
      }
    }
    const completionRate =
      activeEnrollments.length > 0
        ? Math.round((completedCount / activeEnrollments.length) * 10000) /
          100
        : 0;

    return {
      id: course.id,
      title: course.title,
      enrollments: enrollmentCount,
      revenueCents,
      completionRate,
      status: course.status as CoursePerformanceRow["status"],
    };
  });

  // Sort by revenue descending
  rows.sort((a, b) => b.revenueCents - a.revenueCents);

  return rows;
}

