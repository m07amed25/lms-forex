"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen } from "lucide-react";
import type { PublicCourseType } from "@/app/data/public-get-courses";

const levelColors: Record<string, string> = {
  Beginner: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  Intermediate: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  Advanced: "text-rose-600 bg-rose-500/10 border-rose-500/30",
};

export default function PublicCourseCard({
  course,
}: {
  course: PublicCourseType;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/courses/${course.slug}`} className="group">
      <Card className="h-full overflow-hidden rounded-2xl border-border/50 bg-card/30 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {!imgError && course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <BookOpen className="size-10 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <CardContent className="flex flex-col gap-3 p-5">
          {/* Level & Category */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${levelColors[course.level] || ""}`}
            >
              {course.level}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {course.category}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          {course.smallDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {course.smallDescription}
            </p>
          )}

          {/* Price & Duration */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
            <span className="text-lg font-bold text-primary">
              {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-3.5" />
              {course.duration}h
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

