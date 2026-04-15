import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const CourseDetailLoading = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {/* Breadcrumb skeleton */}
        <Skeleton className="h-5 w-64" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Thumbnail skeleton */}
      <Skeleton className="w-full max-w-2xl aspect-video rounded-lg" />

      {/* Badges skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Metadata card skeleton */}
      <div className="rounded-lg border p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-48" />
          ))}
        </div>
      </div>

      {/* Description skeleton */}
      <div className="rounded-lg border p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
};

export default CourseDetailLoading;

