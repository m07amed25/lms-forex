import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getMyCoursesData } from "@/app/data/get-my-courses";
import { getSignedVideoUrl } from "@/lib/s3-signed-url";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BookOpen, GraduationCap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Courses",
};

export default async function MyCoursesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const courses = await getMyCoursesData(session!.user.id);

  if (courses.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-20 text-center">
        <BookOpen className="size-16 text-muted-foreground/50" />
        <h1 className="text-2xl font-bold">No courses yet</h1>
        <p className="text-muted-foreground">
          You haven&apos;t enrolled in any courses yet. Browse our catalog to
          get started.
        </p>
        <Link href="/courses" className={buttonVariants()}>
          Browse Courses
        </Link>
      </div>
    );
  }

  const coursesWithImages = await Promise.all(
    courses.map(async (course) => {
      let imageUrl: string;
      try {
        imageUrl = await getSignedVideoUrl(course.fileKey);
      } catch {
        imageUrl = "/logo.png";
      }
      return { ...course, imageUrl };
    }),
  );

  return (
    <div className="container px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Courses</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {coursesWithImages.map((course) => {
          const isComplete = course.progress === 100;
          const lessonUrl = isComplete
            ? `/courses/${course.courseId}/lessons/${course.nextLessonId ?? ""}`
            : `/courses/${course.courseId}/lessons/${course.nextLessonId}`;

          return (
            <Card key={course.courseId} className="flex flex-col overflow-hidden">
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                {isComplete && (
                  <Badge className="absolute top-2 right-2 gap-1">
                    <GraduationCap className="size-3" />
                    Completed
                  </Badge>
                )}
              </div>
              <CardHeader className="pb-2">
                <h2 className="line-clamp-2 text-lg font-semibold">
                  {course.title}
                </h2>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>{course.progress}% complete</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </CardContent>
              <CardFooter>
                <Link
                  href={lessonUrl}
                  className={buttonVariants({
                    className: "w-full",
                    variant: isComplete ? "outline" : "default",
                  })}
                >
                  {isComplete ? "Review Course" : "Continue Learning"}
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

