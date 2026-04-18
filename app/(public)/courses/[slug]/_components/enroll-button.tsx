"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { enrollInCourse } from "../_actions/enroll";
import { toast } from "sonner";
import type { EnrollmentStatus } from "@prisma/client";
import Link from "next/link";

type EnrollButtonProps = {
  courseId: string;
  courseSlug: string;
  price: number;
  enrollmentStatus: EnrollmentStatus | null;
  isAuthenticated: boolean;
};

export default function EnrollButton({
  courseId,
  courseSlug,
  price,
  enrollmentStatus,
  isAuthenticated,
}: EnrollButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (enrollmentStatus === "Active") {
    return (
      <Link
        href={`/courses/${courseSlug}`}
        className={buttonVariants({ size: "lg", className: "gap-2 text-base w-fit" })}
      >
        Continue Learning
      </Link>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?callbackUrl=/courses/${courseSlug}`}
        className={buttonVariants({
          size: "lg",
          className: "gap-2 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow w-fit",
        })}
      >
        {price === 0 ? "Enroll for Free" : "Buy Now"}
      </Link>
    );
  }

  if (price === 0) {
    return (
      <Button
        size="lg"
        disabled={isPending}
        className="gap-2 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow w-fit"
        onClick={() => {
          startTransition(async () => {
            const result = await enrollInCourse(courseId);
            if (result.status === "success") {
              toast.success(result.message);
            } else {
              toast.error(result.message);
            }
          });
        }}
      >
        {isPending ? "Enrolling..." : "Enroll for Free"}
      </Button>
    );
  }

  // Paid course
  return (
    <Button
      size="lg"
      className="gap-2 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow w-fit"
      onClick={() => router.push(`/checkout/${courseId}`)}
    >
      Buy Now
    </Button>
  );
}



