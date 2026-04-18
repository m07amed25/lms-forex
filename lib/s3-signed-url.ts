import "server-only";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "./S3Client";
import { env } from "./env";

export async function getSignedVideoUrl(
  videoFileKey: string,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
    Key: videoFileKey,
  });

  return getSignedUrl(S3, command, { expiresIn: 3600 });
}

