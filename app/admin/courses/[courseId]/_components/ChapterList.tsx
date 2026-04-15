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
import { reorderChapters } from "../_actions/chapter-actions";
import ChapterItem from "./ChapterItem";
import type { AdminChaptersType } from "@/app/data/admin/admin-get-chapters";
import { Skeleton } from "@/components/ui/skeleton";

type ChapterListProps = {
  initialChapters: AdminChaptersType;
  courseId: string;
};

const ChapterList = ({ initialChapters, courseId }: ChapterListProps) => {
  const dndId = useId();
  const [chapters, setChapters] = useState(initialChapters);
  const [isPending, startTransition] = useTransition();

  // Update local state when server-side data changes (e.g., after create/delete)
  // Using a key-based approach: parent re-renders with new initialChapters
  // We sync by comparing lengths/ids
  useState(() => {
    setChapters(initialChapters);
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

    const oldIndex = chapters.findIndex((ch) => ch.id === active.id);
    const newIndex = chapters.findIndex((ch) => ch.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic UI update
    const newChapters = arrayMove(chapters, oldIndex, newIndex);
    setChapters(newChapters);

    // Persist to server
    startTransition(async () => {
      const items = newChapters.map((ch, index) => ({
        id: ch.id,
        position: index,
      }));

      const { data: result, error } = await tryCatch(
        reorderChapters({ courseId, items }),
      );

      if (error) {
        toast.error(error.message);
        setChapters(chapters); // Revert
        return;
      }

      if (result?.status === "error") {
        toast.error(result.message);
        setChapters(chapters); // Revert
      }
    });
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No chapters yet. Click &quot;Add Chapter&quot; to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isPending && (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
        </div>
      )}
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={chapters.map((ch) => ch.id)}
          strategy={verticalListSortingStrategy}
        >
          {chapters.map((chapter) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              courseId={courseId}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ChapterList;

