import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BookOpen, ChevronRight, Eye, Video } from "lucide-react";
import type { AdminCourseDetailType } from "@/app/data/admin/admin-get-course";

type CourseOutlineProps = {
  course: AdminCourseDetailType;
};

const CourseOutline = ({ course }: CourseOutlineProps) => {
  const chapters = course.chapters ?? [];
  const totalLessons = chapters.reduce(
    (acc, ch) => acc + ch.lessons.length,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Outline
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">
              {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline">
              {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chapters.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No chapters yet. Add chapters to build your course structure.
          </p>
        ) : (
          <div className="space-y-1">
            {chapters.map((chapter, index) => (
              <Collapsible key={chapter.id}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full rounded-md p-2 hover:bg-muted/50 transition-colors text-left group">
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-open:rotate-90" />
                  <span className="text-sm font-medium flex-1 truncate">
                    {index + 1}. {chapter.title}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {chapter.lessons.length} lesson
                    {chapter.lessons.length !== 1 ? "s" : ""}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-6 pl-4 border-l space-y-1 py-1">
                    {chapter.lessons.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-1">
                        No lessons in this chapter.
                      </p>
                    ) : (
                      chapter.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2 py-1 text-sm text-muted-foreground"
                        >
                          <span className="w-6 text-xs text-right">
                            {lessonIndex + 1}.
                          </span>
                          <span className="flex-1 truncate">
                            {lesson.title}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {lesson.isFreePreview && (
                              <Eye className="h-3.5 w-3.5 text-green-500" />
                            )}
                            {lesson.videoFileKey && (
                              <Video className="h-3.5 w-3.5 text-blue-500" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseOutline;


