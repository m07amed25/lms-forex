import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

type CallbackStatusProps = {
  variant: "success" | "processing" | "failure";
  courseTitle?: string;
  courseSlug?: string;
  courseId?: string;
};

export default function CallbackStatus({
  variant,
  courseTitle,
  courseSlug,
  courseId,
}: CallbackStatusProps) {
  if (variant === "success") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto size-16 text-emerald-500 mb-2" />
          <CardTitle>Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            You are now enrolled in <strong>{courseTitle}</strong>. Start
            learning right away!
          </p>
        </CardContent>
        <CardFooter>
          <Link
            href={`/courses/${courseSlug}`}
            className={buttonVariants({ className: "w-full" })}
          >
            Start Learning
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (variant === "processing") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <Clock className="mx-auto size-16 text-amber-500 mb-2" />
          <CardTitle>Payment Processing</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Your payment is being processed. This usually takes a few seconds.
            Please refresh the page shortly.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Link
            href=""
            className={buttonVariants({ variant: "outline", className: "w-full" })}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Link>
          <Link
            href="/courses"
            className={buttonVariants({ variant: "secondary", className: "w-full" })}
          >
            Browse Courses
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <XCircle className="mx-auto size-16 text-red-500 mb-2" />
        <CardTitle>Payment Failed</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">
          Unfortunately, your payment could not be processed. Please try again.
        </p>
      </CardContent>
      <CardFooter>
        <Link
          href={courseId ? `/checkout/${courseId}` : "/courses"}
          className={buttonVariants({ className: "w-full" })}
        >
          Try Again
        </Link>
      </CardFooter>
    </Card>
  );
}





