"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const CourseDetailError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error("[Course Detail Error]:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-100 rounded-xl border-2 border-dashed border-destructive/30 bg-destructive/5 p-8 text-center">
      <div className="rounded-full bg-destructive/10 p-6 mb-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground mt-2 max-w-sm">
        We encountered an error loading this course. Please try again.
      </p>
      <div className="flex gap-3 mt-6">
        <Link
          href="/admin/courses"
          className={buttonVariants({ variant: "outline" })}
        >
          Back to Courses
        </Link>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
};

export default CourseDetailError;

