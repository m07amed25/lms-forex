import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { env } from "@/lib/env";
import { S3 } from "@/lib/S3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import ip from "@arcjet/ip";
import { getAdmin } from "@/app/data/admin/require-admin";

export const dynamic = "force-dynamic";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    }),
  );

export async function DELETE(request: Request) {
  const admin = await getAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const fingerprint = admin.id || ip(request) || "127.0.0.1";
    const decision = await aj.protect(request, {
      fingerprint,
    });

    if (decision.isDenied()) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Arcjet delete denied", {
          conclusion: decision.conclusion,
          reason: decision.reason,
        });
      } else {
        console.warn("Arcjet delete denied");
      }
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { error: "Too many requests. Please try again in a minute." },
          { status: 429 },
        );
      }

      return NextResponse.json(
        { error: "Access denied. Security rule triggered." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const command = new DeleteObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
    });

    await S3.send(command);

    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
