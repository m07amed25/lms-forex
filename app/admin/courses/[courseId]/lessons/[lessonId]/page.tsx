import adminGetLesson from "@/app/data/admin/admin-get-lesson";
import { notFound } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import LessonEditorForm from "./_components/LessonEditorForm";

type LessonEditorPageProps = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

const LessonEditorPage = async ({ params }: LessonEditorPageProps) => {
  const { courseId, lessonId } = await params;
  const lesson = await adminGetLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/courses">Courses</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/admin/courses/${courseId}`}>
                Course
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{lesson.chapter.title}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{lesson.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Edit Lesson
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Edit lesson content, toggle free preview, and manage video
          </p>
        </div>
      </div>

      <Separator />

      <LessonEditorForm lesson={lesson} courseId={courseId} />
    </div>
  );
};

export default LessonEditorPage;

