import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

const requiredString = z.string().min(1);
const optionalString = requiredString.optional();

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: requiredString,
    BETTER_AUTH_URL: z.string().url(),
    GITHUB_ID: optionalString,
    GITHUB_SECRET: optionalString,
    RESEND_API_KEY: optionalString,
    SMTP_HOST: optionalString,
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: optionalString,
    SMTP_PASS: optionalString,
    SMTP_FROM: optionalString,
    SMTP_FROM_NAME: optionalString,
    ARCJET_KEY: optionalString,
    ARCJET_ENV: optionalString,
    AWS_ACCESS_KEY_ID: optionalString,
    AWS_SECRET_ACCESS_KEY: optionalString,
    AWS_ENDPOINT_URL_S3: z.string().url().optional(),
    AWS_ENDPOINT_URL_IAM: z.string().url().optional(),
    AWS_REGION: optionalString,
    PAYMOB_SECRET_KEY: optionalString,
    PAYMOB_PUBLIC_KEY: optionalString,
    PAYMOB_HMAC_SECRET: optionalString,
    PAYMOB_CARD_INTEGRATION_ID: optionalString,
    PAYMOB_WALLET_INTEGRATION_ID: optionalString,
  },
  client: {
    NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES: optionalString,
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES:
      process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.NODE_ENV === "test" ||
    process.env.npm_lifecycle_event === "build",
  emptyStringAsUndefined: true,
});
