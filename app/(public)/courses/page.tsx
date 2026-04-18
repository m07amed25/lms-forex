import { Suspense } from "react";
import publicGetCourses from "@/app/data/public-get-courses";
import publicGetCategories from "@/app/data/public-get-categories";
import CourseCatalogGrid from "./_components/course-catalog-grid";
import CatalogPagination from "./_components/catalog-pagination";
import CourseSearch from "./_components/course-search";
import CourseFilters from "./_components/course-filters";
import { SearchX, GraduationCap } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

type CoursesPageProps = {
  searchParams: Promise<{
    search?: string;
    level?: string;
    category?: string;
    page?: string;
  }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;

  const [{ courses, totalCount, totalPages, currentPage }, categories] =
    await Promise.all([
      publicGetCourses({
        search: params.search,
        level: params.level,
        category: params.category,
        page: params.page ? parseInt(params.page, 10) : undefined,
      }),
      publicGetCategories(),
    ]);

  // Fetch enrolled course IDs for the current user
  const session = await auth.api.getSession({ headers: await headers() });
  let enrolledCourseIds: string[] = [];
  if (session) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id, status: "Active" },
      select: { courseId: true },
    });
    enrolledCourseIds = enrollments.map((e) => e.courseId);
  }

  const hasActiveFilters = params.search || params.level || params.category;

  return (
    <div className="flex flex-col gap-8 py-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Browse Courses
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Discover our collection of trading courses designed for every skill
          level.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Suspense fallback={null}>
          <CourseSearch />
        </Suspense>
        <Suspense fallback={null}>
          <CourseFilters categories={categories} />
        </Suspense>
      </div>

      {/* Results */}
      {courses.length === 0 ? (
        hasActiveFilters ? (
          <div className="flex flex-col items-center justify-center min-h-100 rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="rounded-full bg-muted p-6 mb-4">
              <SearchX className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">
              No courses match your filters
            </h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Try adjusting your search or filter criteria to find what
              you&apos;re looking for.
            </p>
            <Link
              href="/courses"
              className={`${buttonVariants({ variant: "outline" })} mt-6`}
            >
              Clear Filters
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-100 rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">
              No courses available yet
            </h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Check back soon! We&apos;re working on exciting new content for
              you.
            </p>
          </div>
        )
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {courses.length} of {totalCount} course
            {totalCount !== 1 ? "s" : ""}
          </p>

          <CourseCatalogGrid courses={courses} enrolledCourseIds={enrolledCourseIds} />

          <CatalogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={{
              search: params.search,
              level: params.level,
              category: params.category,
            }}
          />
        </>
      )}
    </div>
  );
}

