import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUserProfileLoading() {
  return (
    <div className="container space-y-8 px-4 py-8">
      <Skeleton className="h-6 w-48" />

      {/* Profile Header Skeleton */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Skeleton className="size-24 rounded-full sm:size-28" />
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Courses Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

