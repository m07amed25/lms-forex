import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { buttonVariants } from "@/components/ui/button";
import { Plus, GraduationCap } from "lucide-react";
import Link from "next/link";
const CoursesPage = async () => {
  const data = await adminGetCourses();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Courses
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your educational content and student learning paths
          </p>
        </div>
        <Link
          href={"/admin/courses/create"}
          className={`${buttonVariants({
            variant: "default",
            size: "lg",
          })} flex items-center gap-2 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all`}
        >
          <Plus className="h-5 w-5" />
          Create New Course
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">No courses found</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            You haven&apos;t created any courses yet. Start by building your
            first curriculum to share with your students.
          </p>
          <Link
            href="/admin/courses/create"
            className={`${buttonVariants({ variant: "outline" })} mt-6`}
          >
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div>
          {data.map((course) => (
            <div key={course.id}>
              <p>{course.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
