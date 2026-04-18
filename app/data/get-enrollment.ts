import { prisma } from "@/lib/db";

export async function getEnrollment(userId: string, courseId: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return enrollment;
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    return null;
  }
}
