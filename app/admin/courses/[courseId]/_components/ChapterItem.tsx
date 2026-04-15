"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { GripVertical, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditChapterDialog from "./EditChapterDialog";
import DeleteChapterDialog from "./DeleteChapterDialog";
import type { AdminChapterType } from "@/app/data/admin/admin-get-chapters";
import { useState } from "react";
import LessonList from "./LessonList";

type ChapterItemProps = {
  chapter: AdminChapterType;
  courseId: string;
};

const ChapterItem = ({ chapter, courseId }: ChapterItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-card ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        <span className="flex-1 text-sm font-medium truncate">
          {chapter.title}
        </span>

        <Badge variant="secondary" className="text-xs">
          {chapter._count.lessons} lesson{chapter._count.lessons !== 1 ? "s" : ""}
        </Badge>

        <div className="flex items-center gap-1">
          <EditChapterDialog
            chapterId={chapter.id}
            currentTitle={chapter.title}
          />
          <DeleteChapterDialog
            chapterId={chapter.id}
            chapterTitle={chapter.title}
            lessonCount={chapter._count.lessons}
          />
        </div>
      </div>

      {expanded && (
        <div className="border-t px-3 pb-3 pt-2">
          <LessonList
            lessons={chapter.lessons}
            chapterId={chapter.id}
            courseId={courseId}
          />
        </div>
      )}
    </div>
  );
};

export default ChapterItem;

