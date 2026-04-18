"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen } from "lucide-react";
import type { PublicCourseDetailType } from "@/app/data/public-get-course-by-slug";
import type { EnrollmentStatus } from "@prisma/client";
import EnrollButton from "./enroll-button";

const levelColors: Record<string, string> = {
  Beginner: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  Intermediate: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  Advanced: "text-rose-600 bg-rose-500/10 border-rose-500/30",
};

export default function CourseHero({
  course,
  enrollmentStatus,
  isAuthenticated,
}: {
  course: PublicCourseDetailType;
  enrollmentStatus: EnrollmentStatus | null;
  isAuthenticated: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
        {!imgError && course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <BookOpen className="size-16 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`text-sm font-semibold ${levelColors[course.level] || ""}`}
          >
            {course.level}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {course.category}
          </Badge>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {course.title}
        </h1>

        <div className="flex items-center gap-6 text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {course.duration} hours
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-4" />
            {course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)}{" "}
            lessons
          </span>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <span className="text-3xl font-bold text-primary">
            {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
          </span>
        </div>

        <EnrollButton
          courseId={course.id}
          courseSlug={course.slug}
          price={course.price}
          enrollmentStatus={enrollmentStatus}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </section>
  );
}

