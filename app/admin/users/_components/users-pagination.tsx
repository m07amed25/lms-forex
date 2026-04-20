import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type UsersPaginationProps = {
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
  return queryString ? `/admin/users?${queryString}` : "/admin/users";
}

export default function UsersPagination({
  currentPage,
  totalPages,
  searchParams,
}: UsersPaginationProps) {
  if (totalPages <= 1) return null;

  // Show at most 5 page buttons centered around currentPage
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2">
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

      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <Link
            key={page}
            href={buildPageUrl(page, searchParams)}
            className={buttonVariants({
              variant: page === currentPage ? "default" : "outline",
              size: "sm",
              className:
                page === currentPage ? "pointer-events-none text-white" : "",
            })}
          >
            {page}
          </Link>
        ))}
      </div>

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
}

