import { Suspense } from "react";
import adminGetCourses from "@/app/data/admin/admin-get-courses";
import { buttonVariants } from "@/components/ui/button";
import { Plus, GraduationCap, SearchX } from "lucide-react";
import Link from "next/link";
import AdminCourseCard from "./_components/adminCourseCard";
import CourseFilters from "./_components/CourseFilters";
import CoursePagination from "./_components/CoursePagination";

type CoursesPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    level?: string;
    category?: string;
    page?: string;
  }>;
};

const CoursesPage = async ({ searchParams }: CoursesPageProps) => {
  const params = await searchParams;

  const { courses, totalCount, totalPages, currentPage } =
    await adminGetCourses({
      search: params.search,
      status: params.status,
      level: params.level,
      category: params.category,
      page: params.page ? parseInt(params.page, 10) : undefined,
    });

  const hasActiveFilters =
    params.search || params.status || params.level || params.category;

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

      {/* Filters */}
      <Suspense fallback={null}>
        <CourseFilters />
      </Suspense>

      {/* Course Grid or Empty State */}
      {courses.length === 0 ? (
        hasActiveFilters ? (
          /* Filtered empty state — no courses match criteria */
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="rounded-full bg-muted p-6 mb-4">
              <SearchX className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No matching courses</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
              No courses match your current search and filter criteria. Try
              adjusting your filters or clearing them.
            </p>
          </div>
        ) : (
          /* Generic empty state — no courses exist at all */
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
        )
      ) : (
        <>
          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing {courses.length} of {totalCount} course
            {totalCount !== 1 ? "s" : ""}
          </p>

          {/* Course Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map((course) => (
              <AdminCourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Pagination */}
          <CoursePagination
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={{
              search: params.search,
              status: params.status,
              level: params.level,
              category: params.category,
            }}
          />
        </>
      )}
    </div>
  );
};

export default CoursesPage;
