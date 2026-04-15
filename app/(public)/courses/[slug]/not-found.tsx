import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-16">
      <div className="rounded-full bg-muted p-6 mb-6">
        <BookOpen className="size-12 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Course Not Found
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        The course you&apos;re looking for doesn&apos;t exist or is no longer
        available. It may have been unpublished or the URL might be incorrect.
      </p>
      <Link
        href="/courses"
        className={buttonVariants({
          variant: "default",
          size: "lg",
          className: "gap-2",
        })}
      >
        <ArrowLeft className="size-4" />
        Browse All Courses
      </Link>
    </div>
  );
}

