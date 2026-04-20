import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { tryCatch } from "@/hooks/try-catch";
import arcjetClient, { slidingWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import type { PaymentMethodDistribution } from "@/lib/types/analytics";

export async function adminGetPaymentMethods(): Promise<
  PaymentMethodDistribution[]
> {
  const admin = await requireAdmin();

  const aj = arcjetClient.withRule(
    slidingWindow({ mode: "LIVE", interval: "1m", max: 60 })
  );
  const req = await request();
  const decision = await aj.protect(req, { fingerprint: admin.id });
  if (decision.isDenied()) {
    throw new Error("Too many requests. Please wait.");
  }

  const { data: rawData, error } = await tryCatch(
    prisma.$queryRaw<
      { method: string; count: bigint; amount_cents: bigint }[]
    >`
      SELECT
        COALESCE("paymentMethod", 'Unknown') as method,
        COUNT(*)::bigint as count,
        COALESCE(SUM("amountCents"), 0)::bigint as amount_cents
      FROM "order"
      WHERE status = 'Completed'
      GROUP BY COALESCE("paymentMethod", 'Unknown')
      ORDER BY amount_cents DESC
    `
  );

  if (error) throw new Error("Failed to fetch payment methods");

  return rawData.map((row) => ({
    method: row.method,
    count: Number(row.count),
    amountCents: Number(row.amount_cents),
  }));
}


