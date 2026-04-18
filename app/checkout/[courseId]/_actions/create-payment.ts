"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { createPaymentSchema } from "@/lib/zodSchema";
import { createIntention, buildCheckoutUrl } from "@/lib/paymob";
import { env } from "@/lib/env";
import { tryCatch } from "@/hooks/try-catch";
import arcjetClient, { slidingWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";

type PaymentResult =
  | { status: "success"; redirectUrl: string }
  | { status: "error"; message: string };

export async function createPaymentIntention(
  courseId: string
): Promise<PaymentResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { status: "error", message: "Authentication required" };
  }

  const parsed = createPaymentSchema.safeParse({ courseId });
  if (!parsed.success) {
    return { status: "error", message: "Invalid course ID" };
  }

  // Rate limit: 5 requests / 60s per user
  const aj = arcjetClient.withRule(
    slidingWindow({ mode: "LIVE", interval: "1m", max: 5 })
  );
  const req = await request();
  const decision = await aj.protect(req, {
    fingerprint: session.user.id,
  });
  if (decision.isDenied()) {
    return { status: "error", message: "Too many requests. Please wait." };
  }

  const course = await prisma.course.findUnique({
    where: { id: parsed.data.courseId, isPublished: true, status: "Published" },
    select: { id: true, title: true, price: true, slug: true, smallDescription: true },
  });

  if (!course) {
    return { status: "error", message: "Course not available" };
  }

  if (course.price <= 0) {
    return { status: "error", message: "This course is free. Use the enroll button instead." };
  }

  // Check for active enrollment
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });

  if (existingEnrollment?.status === "Active") {
    return { status: "error", message: "Already enrolled in this course" };
  }

  // Create or reuse pending enrollment
  const enrollment = existingEnrollment ?? await prisma.enrollment.create({
    data: {
      userId: session.user.id,
      courseId: course.id,
      status: "Pending",
    },
  });

  const amountCents = Math.round(course.price * 100);

  const cardIntegrationId = env.PAYMOB_CARD_INTEGRATION_ID
    ? parseInt(env.PAYMOB_CARD_INTEGRATION_ID, 10)
    : null;
  const walletIntegrationId = env.PAYMOB_WALLET_INTEGRATION_ID
    ? parseInt(env.PAYMOB_WALLET_INTEGRATION_ID, 10)
    : null;

  const paymentMethods = [cardIntegrationId, walletIntegrationId].filter(
    (id): id is number => id !== null && !isNaN(id)
  );

  console.log(JSON.stringify({ event: "payment_methods_debug", paymentMethods, cardIntegrationId, walletIntegrationId }));

  const userName = session.user.name || "Learner";
  const nameParts = userName.split(" ");
  const firstName = nameParts[0] || "Learner";
  const lastName = nameParts.slice(1).join(" ") || "NA";

  const baseUrl = env.NEXT_PUBLIC_APP_URL || env.BETTER_AUTH_URL;

  const { data: intention, error } = await tryCatch(
    createIntention({
      amount: amountCents,
      currency: "EGP",
      payment_methods: paymentMethods,
      items: [
        {
          name: course.title,
          amount: amountCents,
          description: course.smallDescription || course.title,
          quantity: 1,
        },
      ],
      billing_data: {
        first_name: firstName,
        last_name: lastName,
        email: session.user.email,
        phone_number: "NA",
        apartment: "NA",
        floor: "NA",
        street: "NA",
        building: "NA",
        shipping_method: "NA",
        postal_code: "NA",
        city: "NA",
        country: "EG",
        state: "NA",
      },
      extras: {
        courseId: course.id,
        userId: session.user.id,
        enrollmentId: enrollment.id,
      },
      notification_url: `${baseUrl}/api/paymob/webhook`,
      redirection_url: `${baseUrl}/payment/callback`,
    })
  );

  if (error || !intention) {
    console.error(
      JSON.stringify({
        event: "intention_failed",
        userId: session.user.id,
        courseId: course.id,
        error: error?.message,
      })
    );
    return {
      status: "error",
      message: process.env.NODE_ENV === "development"
        ? `Paymob error: ${error?.message ?? "Unknown error"}`
        : "Payment service unavailable. Please try again later.",
    };
  }

  // Create order record
  await prisma.order.create({
    data: {
      enrollmentId: enrollment.id,
      amountCents,
      status: "Pending",
      paymobOrderId: String(intention.intention_order_id),
      paymobIntentionId: intention.id,
    },
  });

  console.log(
    JSON.stringify({
      event: "intention_created",
      userId: session.user.id,
      courseId: course.id,
      amount: amountCents,
      paymobOrderId: intention.intention_order_id,
      intentionId: intention.id,
    })
  );

  const redirectUrl = buildCheckoutUrl(intention.client_secret);
  return { status: "success", redirectUrl };
}




