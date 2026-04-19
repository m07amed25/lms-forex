import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getEnrollment } from "@/app/data/get-enrollment";
import { getCoursePlayerData } from "@/app/data/get-course-player-data";
import { CourseSidebar } from "./_components/course-sidebar";
import { Progress } from "@/components/ui/progress";

export default async function CoursePlayerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  // Resolve slug to course ID
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!course) {
    redirect("/courses");
  }

  const courseId = course.id;

  const enrollment = await getEnrollment(session.user.id, courseId);

  if (!enrollment || enrollment.status !== "Active") {
    redirect(`/courses`);
  }

  const data = await getCoursePlayerData(courseId, session.user.id);

  if (!data || data.chapters.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-bold">No content yet</h1>
        <p className="text-muted-foreground">
          This course has no content yet. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100svh-3.5rem)]">
      <CourseSidebar
        courseSlug={slug}
        courseTitle={data.course.title}
        chapters={data.chapters}
        progress={data.progress}
      />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="border-b bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-sm font-semibold truncate">
              {data.course.title}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">
                {data.progress.percentage}%
              </span>
              <Progress value={data.progress.percentage} className="h-2 w-24" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

