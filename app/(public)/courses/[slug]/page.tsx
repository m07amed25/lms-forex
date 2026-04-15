import { notFound } from "next/navigation";
import publicGetCourseBySlug from "@/app/data/public-get-course-by-slug";
import CourseHero from "./_components/course-hero";
import CourseDescription from "./_components/course-description";
import CourseCurriculum from "./_components/course-curriculum";
import { Separator } from "@/components/ui/separator";

type CourseDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  const { slug } = await params;
  const course = await publicGetCourseBySlug(slug);

  if (!course) notFound();

  return (
    <div className="flex flex-col gap-10 py-8">
      <CourseHero course={course} />
      <Separator />
      <CourseDescription descriptionHtml={course.descriptionHtml} />
      <Separator />
      <CourseCurriculum chapters={course.chapters} />
    </div>
  );
}

