"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { markLessonComplete } from "../_actions/mark-complete";
import { markLessonIncomplete } from "../_actions/mark-incomplete";

type MarkCompleteButtonProps = {
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  nextLessonUrl: string | null;
  nextLessonTitle: string | null;
  isLastLesson: boolean;
};

export function MarkCompleteButton({
  lessonId,
  courseId,
  isCompleted,
  nextLessonUrl,
  nextLessonTitle,
  isLastLesson,
}: MarkCompleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      const action = isCompleted ? markLessonIncomplete : markLessonComplete;
      const result = await action({ lessonId, courseId });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();

      // Trigger auto-advance event when marking complete
      if (!isCompleted) {
        window.dispatchEvent(
          new CustomEvent("lesson-completed", {
            detail: { nextLessonUrl, nextLessonTitle, isLastLesson },
          }),
        );
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={isCompleted ? "outline" : "default"}
      className="gap-2"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isCompleted ? (
        <CheckCircle2 className="size-4 text-emerald-500" />
      ) : (
        <Circle className="size-4" />
      )}
      {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
    </Button>
  );
}

