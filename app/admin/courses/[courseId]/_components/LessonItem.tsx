"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Eye, Video } from "lucide-react";
import Link from "next/link";

type LessonSummary = {
  id: string;
  title: string;
  position: number;
  isFreePreview: boolean;
  videoFileKey: string | null;
};

type LessonItemProps = {
  lesson: LessonSummary;
  courseId: string;
};

const LessonItem = ({ lesson, courseId }: LessonItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-md border bg-muted/50 p-2 ${isDragging ? "opacity-50 shadow-md" : ""}`}
    >
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <Link
        href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
        className="flex-1 text-sm hover:underline truncate"
      >
        {lesson.title}
      </Link>

      <div className="flex items-center gap-1.5">
        {lesson.isFreePreview && (
          <Badge variant="outline" className="text-xs gap-1">
            <Eye className="h-3 w-3" />
            Free
          </Badge>
        )}
        {lesson.videoFileKey && (
          <Video className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
    </div>
  );
};

export default LessonItem;

