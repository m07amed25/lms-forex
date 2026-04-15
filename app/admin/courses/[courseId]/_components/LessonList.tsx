"use client";

import { useId, useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/try-catch";
import { reorderLessons } from "../_actions/lesson-actions";
import LessonItem from "./LessonItem";
import CreateLessonDialog from "./CreateLessonDialog";
import { Skeleton } from "@/components/ui/skeleton";

type LessonSummary = {
  id: string;
  title: string;
  position: number;
  isFreePreview: boolean;
  videoFileKey: string | null;
};

type LessonListProps = {
  lessons: LessonSummary[];
  chapterId: string;
  courseId: string;
};

const LessonList = ({ lessons: initialLessons, chapterId, courseId }: LessonListProps) => {
  const dndId = useId();
  const [lessons, setLessons] = useState(initialLessons);
  const [isPending, startTransition] = useTransition();

  useState(() => {
    setLessons(initialLessons);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic UI update
    const newLessons = arrayMove(lessons, oldIndex, newIndex);
    setLessons(newLessons);

    // Persist to server
    startTransition(async () => {
      const items = newLessons.map((l, index) => ({
        id: l.id,
        position: index,
      }));

      const { data: result, error } = await tryCatch(
        reorderLessons({ chapterId, items }),
      );

      if (error) {
        toast.error(error.message);
        setLessons(lessons); // Revert
        return;
      }

      if (result?.status === "error") {
        toast.error(result.message);
        setLessons(lessons); // Revert
      }
    });
  }

  return (
    <div className="space-y-2">
      {isPending && <Skeleton className="h-8 w-full" />}
      {lessons.length > 0 ? (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lessons.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {lessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                courseId={courseId}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-xs text-muted-foreground py-2">
          No lessons yet.
        </p>
      )}
      <CreateLessonDialog chapterId={chapterId} courseId={courseId} />
    </div>
  );
};

export default LessonList;

