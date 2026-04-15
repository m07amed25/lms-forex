"use client";

import { useState } from "react";
import { Lock, Eye, Play, ChevronDown, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PublicCourseDetailType } from "@/app/data/public-get-course-by-slug";
import LessonPreviewDialog from "./lesson-preview-dialog";

type Chapter = PublicCourseDetailType["chapters"][0];

export default function CourseCurriculum({
  chapters,
}: {
  chapters: Chapter[];
}) {
  const [openChapters, setOpenChapters] = useState<Set<string>>(
    () => new Set(chapters.map((ch) => ch.id)),
  );
  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);

  if (chapters.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Curriculum</h2>
        <div className="flex flex-col items-center justify-center min-h-50 rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center">
          <BookOpen className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Curriculum coming soon</p>
        </div>
      </section>
    );
  }

  function toggleChapter(chapterId: string) {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  }

  const totalLessons = chapters.reduce(
    (acc, ch) => acc + ch.lessons.length,
    0,
  );
  const freePreviews = chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.isFreePreview).length,
    0,
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Curriculum</h2>
        <p className="text-sm text-muted-foreground">
          {chapters.length} chapter{chapters.length !== 1 ? "s" : ""} ·{" "}
          {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
          {freePreviews > 0 && ` · ${freePreviews} free preview${freePreviews !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="space-y-3">
        {chapters.map((chapter) => {
          const isOpen = openChapters.has(chapter.id);
          return (
            <div
              key={chapter.id}
              className="rounded-xl border border-border/50 bg-card/30 overflow-hidden"
            >
              {/* Chapter Header */}
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "" : "-rotate-90"
                    }`}
                  />
                  <span className="font-semibold">{chapter.title}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {chapter.lessons.length} lesson
                  {chapter.lessons.length !== 1 ? "s" : ""}
                </span>
              </button>

              {/* Lessons */}
              {isOpen && chapter.lessons.length > 0 && (
                <div className="border-t border-border/50">
                  {chapter.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between px-4 py-3 pl-11 ${
                        lesson.isFreePreview
                          ? "hover:bg-muted/50 cursor-pointer"
                          : ""
                      } transition-colors border-b border-border/30 last:border-0`}
                      onClick={
                        lesson.isFreePreview
                          ? () => setPreviewLessonId(lesson.id)
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-3">
                        {lesson.isFreePreview ? (
                          <Play className="size-4 text-primary" />
                        ) : (
                          <Lock className="size-4 text-muted-foreground/60" />
                        )}
                        <span
                          className={
                            lesson.isFreePreview
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.isFreePreview ? (
                          <Badge
                            variant="outline"
                            className="text-xs text-primary border-primary/30 bg-primary/5 gap-1"
                          >
                            <Eye className="size-3" />
                            Free Preview
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">
                            Enrolled only
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <LessonPreviewDialog
        lessonId={previewLessonId}
        onCloseAction={() => setPreviewLessonId(null)}
      />
    </section>
  );
}



