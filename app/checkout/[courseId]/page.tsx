import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getEnrollment } from "@/app/data/get-enrollment";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import CheckoutForm from "./_components/checkout-form";
import Image from "next/image";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { env } from "@/lib/env";

type CheckoutPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { courseId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/login?callbackUrl=/checkout/${courseId}`);
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId, isPublished: true, status: "Published" },
    select: { id: true, title: true, price: true, slug: true, fileKey: true, smallDescription: true },
  });

  if (!course) notFound();

  if (course.price <= 0) {
    redirect(`/courses/${course.slug}`);
  }

  const enrollment = await getEnrollment(session.user.id, course.id);

  if (enrollment?.status === "Active") {
    return (
      <div className="container max-w-lg mx-auto py-16">
        <Card>
          <CardHeader>
            <CardTitle>Already Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You are already enrolled in <strong>{course.title}</strong>.
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href={`/courses/${course.slug}`}
              className={buttonVariants({ className: "w-full" })}
            >
              Go to Course
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  let imageUrl = "";
  if (course.fileKey) {
    const command = new GetObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: course.fileKey,
    });
    imageUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
  }

  return (
    <div className="container max-w-lg mx-auto py-16">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={imageUrl}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 512px) 100vw, 512px"
              />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold">{course.title}</h2>
            {course.smallDescription && (
              <p className="text-sm text-muted-foreground mt-1">
                {course.smallDescription}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-muted-foreground">Total</span>
            <Badge variant="secondary" className="text-lg font-bold">
              {course.price.toFixed(2)} EGP
            </Badge>
          </div>
        </CardContent>
        <CardFooter>
          <CheckoutForm courseId={course.id} />
        </CardFooter>
      </Card>
    </div>
  );
}



