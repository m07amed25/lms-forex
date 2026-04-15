"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getPreviewAction } from "../_actions/get-preview";
import { Loader2, BookOpen } from "lucide-react";
import type { LessonPreviewType } from "@/app/data/public-get-lesson-preview";

export default function LessonPreviewDialog({
  lessonId,
  onCloseAction,
}: {
  lessonId: string | null;
  onCloseAction: () => void;
}) {
  const [lesson, setLesson] = useState<LessonPreviewType | null>(null);
  const [loading, setLoading] = useState(false);
  const prevLessonIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (lessonId === prevLessonIdRef.current) return;
    prevLessonIdRef.current = lessonId;

    if (!lessonId) {
      // Defer the state clear to avoid sync setState in effect
      const id = setTimeout(() => setLesson(null), 0);
      return () => clearTimeout(id);
    }

    setLoading(true);
    getPreviewAction(lessonId)
      .then((data) => {
        setLesson(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [lessonId]);

  const isOpen = lessonId !== null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCloseAction();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground">Loading preview...</p>
          </div>
        ) : lesson ? (
          <>
            <DialogHeader>
              <DialogDescription className="text-xs text-muted-foreground">
                {lesson.chapter.course.title} · {lesson.chapter.title}
              </DialogDescription>
              <DialogTitle className="text-xl font-bold">
                {lesson.title}
              </DialogTitle>
            </DialogHeader>

            {/* Video */}
            {lesson.videoUrl && (
              <div className="mt-4 rounded-xl overflow-hidden bg-black">
                <video
                  controls
                  className="w-full aspect-video"
                  src={lesson.videoUrl}
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Content */}
            {lesson.contentHtml ? (
              <div
                className="mt-4 prose prose-neutral dark:prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="size-8 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">
                  No content available yet.
                </p>
              </div>
            )}

            {/* Enrollment prompt */}
            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground">
                Enjoyed this preview? Enroll in the full course to access all
                lessons.
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="size-8 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">
              No content available for this lesson.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
