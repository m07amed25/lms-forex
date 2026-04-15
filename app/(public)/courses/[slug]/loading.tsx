import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailsLoading() {
  return (
    <div className="flex flex-col gap-10 py-8">
      {/* Hero skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>

      {/* Description skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Curriculum skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-36" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 p-4 space-y-3">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

