import { env } from "@/lib/env";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "@/lib/S3Client";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import ip from "@arcjet/ip";
import { getAdmin } from "@/app/data/admin/require-admin";

export const dynamic = "force-dynamic";

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  contentType: z.string().min(1, "Content type is required"),
  size: z.number().min(1, "Size is required"),
  isImage: z.boolean(),
});

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

export async function POST(request: Request) {
  const admin = await getAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }
  try {
    const fingerprint = admin.id || ip(request) || "127.0.0.1";
    const decision = await aj.protect(request, {
      fingerprint,
    });

    console.log(
      "Arcjet Decision:",
      decision.conclusion,
      "Rule:",
      decision.reason,
    );

    if (decision.isDenied()) {
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

    const validatedBody = fileUploadSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { fileName, contentType, size } = validatedBody.data;

    const uniqueKey = `${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      ContentType: contentType,
      ContentLength: size,
      Key: uniqueKey,
    });

    const presignedUrl = await getSignedUrl(S3, command, {
      expiresIn: 360, // 6 minutes
    });

    const respone = {
      presignedUrl,
      key: uniqueKey,
    };

    return NextResponse.json(respone);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 },
    );
  }
}
