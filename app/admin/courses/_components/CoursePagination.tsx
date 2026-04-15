import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CoursePaginationProps = {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

function buildPageUrl(
  page: number,
  searchParams: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") {
      params.set(key, value);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `/admin/courses?${queryString}` : "/admin/courses";
}

const CoursePagination = ({
  currentPage,
  totalPages,
  searchParams,
}: CoursePaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Page */}
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(currentPage - 1, searchParams)}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Link>
      ) : (
        <span
          className={`${buttonVariants({ variant: "outline", size: "sm" })} pointer-events-none opacity-50`}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={buildPageUrl(page, searchParams)}
            className={buttonVariants({
              variant: page === currentPage ? "default" : "outline",
              size: "sm",
              className:
                page === currentPage ? "text-white pointer-events-none" : "",
            })}
          >
            {page}
          </Link>
        ))}
      </div>

      {/* Next Page */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(currentPage + 1, searchParams)}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={`${buttonVariants({ variant: "outline", size: "sm" })} pointer-events-none opacity-50`}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </div>
  );
};

export default CoursePagination;
