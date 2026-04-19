"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2,
  ChevronDown,
  Menu,
  PlayCircle,
  FileText,
} from "lucide-react";

type Chapter = {
  id: string;
  title: string;
  position: number;
  lessons: {
    id: string;
    title: string;
    position: number;
    hasVideo: boolean;
    isCompleted: boolean;
  }[];
};

type CourseSidebarProps = {
  courseSlug: string;
  courseTitle: string;
  chapters: Chapter[];
  progress: { completed: number; total: number; percentage: number };
};

function SidebarContent({
  courseSlug,
  chapters,
  progress,
  currentLessonId,
}: CourseSidebarProps & { currentLessonId: string | undefined }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>
            {progress.completed}/{progress.total} lessons
          </span>
          <span>{progress.percentage}%</span>
        </div>
        <Progress value={progress.percentage} className="h-2" />
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {chapters.map((chapter) => (
          <Collapsible key={chapter.id} defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
              <span className="truncate">{chapter.title}</span>
              <ChevronDown className="size-4 shrink-0 transition-transform [[data-state=closed]>&]:rotate-[-90deg]" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-2 space-y-0.5">
                {chapter.lessons.map((lesson) => {
                  const isActive = lesson.id === currentLessonId;
                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/${courseSlug}/lessons/${lesson.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {lesson.isCompleted ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                      ) : lesson.hasVideo ? (
                        <PlayCircle className="size-4 shrink-0" />
                      ) : (
                        <FileText className="size-4 shrink-0" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </Link>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </nav>
    </div>
  );
}

export function CourseSidebar(props: CourseSidebarProps) {
  const params = useParams<{ lessonId?: string }>();
  const currentLessonId = params.lessonId;
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <div className="fixed bottom-4 left-4 z-50 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
              render={
                <Button size="icon" variant="outline" className="rounded-full shadow-lg">
                  <Menu className="size-5" />
                </Button>
              }
            />
          <SheetContent side="left" className="w-80 p-0">
            <div className="h-full" onClick={() => setOpen(false)}>
              <SidebarContent {...props} currentLessonId={currentLessonId} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-80 shrink-0 flex-col border-r bg-muted/30 overflow-y-auto">
        <SidebarContent {...props} currentLessonId={currentLessonId} />
      </aside>
    </>
  );
}


