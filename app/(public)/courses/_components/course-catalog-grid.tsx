import { BookOpen } from "lucide-react";
import PublicCourseCard from "./public-course-card";
import type { PublicCourseType } from "@/app/data/public-get-courses";

export default function CourseCatalogGrid({
  courses,
  enrolledCourseIds,
}: {
  courses: PublicCourseType[];
  enrolledCourseIds: string[];
}) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">No courses available yet</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Check back soon! We&apos;re working on exciting new content for you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <PublicCourseCard key={course.slug} course={course} isEnrolled={enrolledCourseIds.includes(course.id)} />
      ))}
    </div>
  );
}

