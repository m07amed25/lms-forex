import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyCallbackHmac } from "@/lib/paymob";
import CallbackStatus from "./_components/callback-status";

type CallbackPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentCallbackPage({
  searchParams,
}: CallbackPageProps) {
  const params = await searchParams;

  const hmac = typeof params.hmac === "string" ? params.hmac : null;
  const orderId = typeof params.order === "string" ? params.order : null;
  const paymobSuccess = params.success === "true";

  if (!hmac || !orderId) {
    console.warn(JSON.stringify({ event: "callback_missing_params", hasHmac: !!hmac, hasOrder: !!orderId }));
    redirect("/courses");
  }

  // Build URLSearchParams for HMAC verification
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      sp.set(key, value);
    }
  }

  const isValid = verifyCallbackHmac(sp, hmac);
  if (!isValid) {
    console.warn(JSON.stringify({ event: "callback_hmac_invalid", orderId, params: Object.fromEntries(sp.entries()) }));
    redirect("/courses");
  }

  // Look up order by paymobOrderId
  const order = await prisma.order.findUnique({
    where: { paymobOrderId: orderId },
    include: {
      enrollment: {
        include: {
          course: {
            select: { id: true, title: true, slug: true },
          },
        },
      },
    },
  });

  if (!order) {
    redirect("/courses");
  }

  const course = order.enrollment.course;

  if (order.enrollment.status === "Active") {
    return (
      <div className="container py-16">
        <CallbackStatus
          variant="success"
          courseTitle={course.title}
          courseSlug={course.slug}
        />
      </div>
    );
  }

  if (order.status === "Pending") {
    if (paymobSuccess) {
      // HMAC-verified success but webhook hasn't arrived yet — activate enrollment directly
      const paymobTransactionId = typeof params.id === "string" ? params.id : null;
      const paymentMethod = typeof params.source_data_type === "string" ? params.source_data_type : null;

      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: "Completed",
            ...(paymobTransactionId && { paymobTransactionId }),
            ...(paymentMethod && { paymentMethod }),
          },
        }),
        prisma.enrollment.update({
          where: { id: order.enrollmentId },
          data: { status: "Active" },
        }),
      ]);

      console.log(
        JSON.stringify({
          event: "callback_activated_enrollment",
          orderId: order.id,
          enrollmentId: order.enrollmentId,
          paymobTransactionId,
        })
      );

      return (
        <div className="container py-16">
          <CallbackStatus
            variant="success"
            courseTitle={course.title}
            courseSlug={course.slug}
          />
        </div>
      );
    }
    // Paymob says payment failed
    return (
      <div className="container py-16">
        <CallbackStatus variant="failure" courseId={course.id} />
      </div>
    );
  }

  // Failed
  return (
    <div className="container py-16">
      <CallbackStatus
        variant="failure"
        courseId={course.id}
      />
    </div>
  );
}


