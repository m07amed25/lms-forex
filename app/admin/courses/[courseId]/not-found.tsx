import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const CourseNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="rounded-full bg-destructive/10 p-6 mb-4">
        <FileQuestion className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold">Course Not Found</h2>
      <p className="text-muted-foreground mt-2 max-w-sm">
        The course you&apos;re looking for doesn&apos;t exist or may have been
        deleted.
      </p>
      <Link
        href="/admin/courses"
        className={`${buttonVariants({ variant: "outline" })} mt-6`}
      >
        Back to Courses
      </Link>
    </div>
  );
};

export default CourseNotFound;
