"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, BookOpen, Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type AutoAdvanceProps = {
  nextLessonUrl: string | null;
  nextLessonTitle: string | null;
  isLastLesson: boolean;
};

const COUNTDOWN_SECONDS = 5;

export function AutoAdvance({
  nextLessonUrl,
  nextLessonTitle,
  isLastLesson,
}: AutoAdvanceProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isExiting, setIsExiting] = useState(false);
  const progressRef = useRef<SVGCircleElement>(null);

  const handleCancel = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setShow(false);
      setIsExiting(false);
      setCountdown(COUNTDOWN_SECONDS);
    }, 200);
  }, []);

  const handleSkip = useCallback(() => {
    if (nextLessonUrl) {
      router.push(nextLessonUrl);
    }
  }, [nextLessonUrl, router]);

  useEffect(() => {
    const handler = () => {
      setShow(true);
      setCountdown(COUNTDOWN_SECONDS);
      setIsExiting(false);
    };

    window.addEventListener("lesson-completed", handler);
    return () => window.removeEventListener("lesson-completed", handler);
  }, []);

  useEffect(() => {
    if (!show || isLastLesson) return;

    if (countdown <= 0 && nextLessonUrl) {
      router.push(nextLessonUrl);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [show, countdown, nextLessonUrl, isLastLesson, router]);

  if (!show) return null;

  // Course complete state
  if (isLastLesson) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300",
          isExiting ? "opacity-0" : "animate-in fade-in duration-300"
        )}
      >
        <div
          className={cn(
            "relative flex flex-col items-center gap-6 rounded-2xl border bg-card p-10 shadow-2xl text-center max-w-md mx-4 transition-all duration-300",
            isExiting
              ? "scale-95 opacity-0"
              : "animate-in zoom-in-95 fade-in duration-500"
          )}
        >
          {/* Decorative background glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 size-40 rounded-full bg-primary/20 blur-3xl" />

          {/* Trophy with animated ring */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex size-20 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/5 ring-2 ring-primary/30">
              <Trophy className="size-10 text-primary drop-shadow-lg" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Course Complete! 🎉
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Congratulations! You&apos;ve finished all the lessons. Great work
              on completing this course.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 h-11 rounded-xl"
            >
              Stay Here
            </Button>
            <Button className="flex-1 h-11 rounded-xl gap-2 shadow-lg shadow-primary/25">
              <Link href="/my-courses" className="flex items-center gap-2">
                <BookOpen className="size-4" />
                My Courses
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Auto-advance countdown
  const progress = (countdown / COUNTDOWN_SECONDS) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300",
        isExiting ? "opacity-0" : "animate-in fade-in duration-300"
      )}
    >
      <div
        className={cn(
          "relative flex flex-col items-center gap-6 rounded-2xl border bg-card p-10 shadow-2xl text-center max-w-md mx-4 transition-all duration-300",
          isExiting
            ? "scale-95 opacity-0"
            : "animate-in zoom-in-95 fade-in duration-500"
        )}
      >
        {/* "Up Next" label */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
          <ArrowRight className="size-3" />
          Up Next
        </div>

        {/* Circular countdown timer */}
        <div className="relative flex items-center justify-center">
          <svg className="size-24 -rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted/30"
            />
            <circle
              ref={progressRef}
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-primary transition-all duration-1000 ease-linear"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <span className="absolute text-3xl font-bold tabular-nums text-foreground">
            {countdown}
          </span>
        </div>

        {/* Next lesson title */}
        <div className="space-y-1 max-w-xs">
          <p className="text-base font-semibold truncate">{nextLessonTitle}</p>
          <p className="text-xs text-muted-foreground">
            Continuing in {countdown} {countdown === 1 ? "second" : "seconds"}…
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 h-11 rounded-xl gap-2"
          >
            <X className="size-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSkip}
            className="flex-1 h-11 rounded-xl gap-2 shadow-lg shadow-primary/25"
          >
            <ArrowRight className="size-4" />
            Go Now
          </Button>
        </div>
      </div>
    </div>
  );
}

