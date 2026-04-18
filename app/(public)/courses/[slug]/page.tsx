import { notFound } from "next/navigation";
import publicGetCourseBySlug from "@/app/data/public-get-course-by-slug";
import CourseHero from "./_components/course-hero";
import CourseDescription from "./_components/course-description";
import CourseCurriculum from "./_components/course-curriculum";
import { Separator } from "@/components/ui/separator";
import { getEnrollment } from "@/app/data/get-enrollment";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type CourseDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  const { slug } = await params;
  const course = await publicGetCourseBySlug(slug);

  if (!course) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const enrollment = session
    ? await getEnrollment(session.user.id, course.id)
    : null;

  return (
    <div className="flex flex-col gap-10 py-8">
      <CourseHero
        course={course}
        enrollmentStatus={enrollment?.status ?? null}
        isAuthenticated={!!session}
      />
      <Separator />
      <CourseDescription descriptionHtml={course.descriptionHtml} />
      <Separator />
      <CourseCurriculum chapters={course.chapters} />
    </div>
  );
}

