import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getSignedVideoUrl } from "@/lib/s3-signed-url";
import Image from "next/image";
import Link from "next/link";
import type { CourseLevel } from "@prisma/client";
import { BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";

interface EnrolledCourse {
  courseId: string;
  title: string;
  slug: string;
  fileKey: string;
  level: CourseLevel;
  category: string;
  enrolledAt: Date;
  progress: { completed: number; total: number; percentage: number };
  firstLessonId: string | null;
}

interface EnrolledCoursesGridProps {
  courses: EnrolledCourse[];
  showCTA?: boolean;
}

const levelColors: Record<string, string> = {
  BEGINNER:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
  INTERMEDIATE:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
  ADVANCED:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400",
};

export default async function EnrolledCoursesGrid({
  courses,
  showCTA = true,
}: EnrolledCoursesGridProps) {
  if (courses.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen className="size-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No courses enrolled yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Start your learning journey by enrolling in one of our courses.
          </p>
          {showCTA && (
            <Link
              href="/courses"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Explore Courses
              <ArrowRight className="size-4" />
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  const coursesWithUrls = await Promise.all(
    courses.map(async (course) => {
      let thumbnailUrl: string | undefined;
      if (course.fileKey) {
        thumbnailUrl = await getSignedVideoUrl(course.fileKey);
      }
      return { ...course, thumbnailUrl };
    }),
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {coursesWithUrls.map((course) => {
        const isCompleted = course.progress.percentage >= 100;

        const learningUrl = course.firstLessonId
          ? `/courses/${course.slug}/lessons/${course.firstLessonId}`
          : `/courses/${course.slug}`;

        return (
          <Link
            key={course.courseId}
            href={learningUrl}
            className="group"
          >
            <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
              <div className="relative aspect-video overflow-hidden">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-muted">
                    <BookOpen className="size-8 text-muted-foreground/30" />
                  </div>
                )}
                {/* Progress overlay bar at bottom of thumbnail */}
                <div className="absolute inset-x-0 bottom-0">
                  <div
                    className={`h-1 transition-all ${
                      isCompleted ? "bg-emerald-500" : "bg-primary"
                    }`}
                    style={{ width: `${course.progress.percentage}%` }}
                  />
                </div>
                {isCompleted && (
                  <div className="absolute right-2 top-2">
                    <div className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                      <CheckCircle2 className="size-3" />
                      Done
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
                    {course.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`shrink-0 border text-[10px] font-semibold ${
                      levelColors[course.level] ?? ""
                    }`}
                  >
                    {course.level}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  {course.category}
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {course.progress.completed}/{course.progress.total} lessons
                    </span>
                    <span className="font-semibold tabular-nums">
                      {course.progress.percentage}%
                    </span>
                  </div>
                  <Progress value={course.progress.percentage} className="h-1.5">
                    <span className="sr-only">
                      {course.progress.percentage}% complete
                    </span>
                  </Progress>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {isCompleted ? "Review Course" : "Continue Learning"}
                  <ArrowRight className="size-3" />
                </span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
