import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookHmac } from "@/lib/paymob";
import arcjetClient, { fixedWindow } from "@/lib/arcjet";

export async function POST(request: NextRequest) {
  // Rate limit: 100 requests / 60s per IP
  const aj = arcjetClient.withRule(
    fixedWindow({ mode: "LIVE", window: "1m", max: 100 })
  );
  const decision = await aj.protect(request, {
    fingerprint: request.headers.get("x-forwarded-for") ?? "unknown",
  });
  if (decision.isDenied()) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const hmac = request.nextUrl.searchParams.get("hmac");

    if (!hmac || !body?.obj) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const isValid = verifyWebhookHmac(body.obj, hmac);
    if (!isValid) {
      console.warn(
        JSON.stringify({
          event: "webhook_hmac_invalid",
          paymobOrderId: body.obj?.order?.id,
        })
      );
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const paymobOrderId = String(body.obj.order?.id);
    const paymobTransactionId = String(body.obj.id);
    const success = body.obj.success === true;
    const paymentMethod = body.obj.source_data?.type ?? null;

    console.log(
      JSON.stringify({
        event: "webhook_received",
        paymobOrderId,
        transactionId: paymobTransactionId,
        success,
        amountCents: body.obj.amount_cents,
      })
    );

    // Find order by paymobOrderId
    const order = await prisma.order.findUnique({
      where: { paymobOrderId },
      include: { enrollment: true },
    });

    if (!order) {
      console.warn(
        JSON.stringify({ event: "webhook_order_not_found", paymobOrderId })
      );
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency check
    if (order.paymobTransactionId) {
      console.log(
        JSON.stringify({
          event: "webhook_duplicate",
          paymobOrderId,
          transactionId: paymobTransactionId,
        })
      );
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (success) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: "Completed",
            paymobTransactionId,
            paymentMethod,
          },
        }),
        prisma.enrollment.update({
          where: { id: order.enrollmentId },
          data: { status: "Active" },
        }),
      ]);

      console.log(
        JSON.stringify({
          event: "payment_completed",
          transactionId: paymobTransactionId,
          userId: order.enrollment.userId,
          courseId: order.enrollment.courseId,
          amount: order.amountCents,
          status: "Completed",
        })
      );
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "Failed",
          paymobTransactionId,
          paymentMethod,
        },
      });

      console.log(
        JSON.stringify({
          event: "payment_failed",
          transactionId: paymobTransactionId,
          userId: order.enrollment.userId,
          courseId: order.enrollment.courseId,
          amount: order.amountCents,
          status: "Failed",
        })
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(
      JSON.stringify({ event: "webhook_error", error: String(error) })
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



