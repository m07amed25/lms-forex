import adminGetCourse from "@/app/data/admin/admin-get-course";
import adminGetChapters from "@/app/data/admin/admin-get-chapters";
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
import CourseDetailView from "./_components/CourseDetailView";
import CourseActions from "./_components/CourseActions";

type CourseDetailPageProps = {
  params: Promise<{ courseId: string }>;
};

const CourseDetailPage = async ({ params }: CourseDetailPageProps) => {
  const { courseId } = await params;
  const [course, chapters] = await Promise.all([
    adminGetCourse(courseId),
    adminGetChapters(courseId),
  ]);

  if (!course) {
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
              <BreadcrumbPage>{course.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {course.title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage course details, publish status, and content
            </p>
          </div>
          <CourseActions
            courseId={course.id}
            courseTitle={course.title}
            status={course.status}
          />
        </div>
      </div>

      <Separator />

      <CourseDetailView course={course} chapters={chapters} />
    </div>
  );
};

export default CourseDetailPage;
