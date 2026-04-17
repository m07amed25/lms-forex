import "server-only";

import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

const s3Credentials =
  env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      }
    : null;

const isS3Configured = Boolean(env.AWS_ENDPOINT_URL_S3 && s3Credentials);

const isBuild =
  process.env.npm_lifecycle_event === "build" ||
  process.env.NEXT_PHASE === "phase-production-build";

if (!isS3Configured && process.env.NODE_ENV !== "test" && !isBuild) {
  console.warn(
    "[S3] AWS S3 env vars are missing. S3 operations will fail until configured.",
  );
}

export const S3 = new S3Client({
  region: env.AWS_REGION ?? "auto",
  endpoint: env.AWS_ENDPOINT_URL_S3 ?? "https://invalid-s3-endpoint.local",
  forcePathStyle: false,
  credentials:
    s3Credentials ??
    (async () => {
      throw new Error(
        "Missing S3 configuration. Set AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.",
      );
    }),
});
