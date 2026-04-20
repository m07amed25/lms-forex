import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-[150px]" />
        <Skeleton className="h-10 w-full sm:w-[150px]" />
      </div>

      {/* Count */}
      <Skeleton className="h-4 w-40" />

      {/* Table */}
      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <div className="flex gap-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="hidden h-4 w-20 sm:block" />
            <Skeleton className="hidden h-4 w-20 md:block" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-14" />
            <Skeleton className="hidden h-4 w-6 sm:block" />
            <Skeleton className="hidden h-4 w-20 md:block" />
            <Skeleton className="ml-auto h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

