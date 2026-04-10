import { auth } from "@/lib/auth";
import ip from "@arcjet/ip";
import arcjet from "@/lib/arcjet";
import {
  type BotOptions,
  type EmailOptions,
  type ProtectSignupOptions,
  type SlidingWindowRateLimitOptions,
  detectBot,
  protectSignup,
  slidingWindow,
} from "@arcjet/next";
import { NextRequest } from "next/server";

const emailOptions = {
  mode: "LIVE",
  deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
} satisfies EmailOptions;

const botOptions = {
  mode: "LIVE",
  allow: [],
} satisfies BotOptions;

const rateLimitOptions = {
  mode: "LIVE",
  interval: "2m",
  max: 10,
} satisfies SlidingWindowRateLimitOptions<[]>;

const signupOptions = {
  email: emailOptions,
  bots: botOptions,
  rateLimit: rateLimitOptions,
} satisfies ProtectSignupOptions<[]>;

async function protect(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  let userId: string;
  if (session?.user?.id) {
    userId = session.user.id;
  } else {
    userId = ip(request) || "127.0.0.1";
  }

  if (
    request.nextUrl.pathname.startsWith("/api/auth/sign-up") ||
    request.nextUrl.pathname.startsWith("/api/auth/signup")
  ) {
    try {
      const body = await request.clone().json();

      if (typeof body.email === "string") {
        return arcjet
          .withRule(protectSignup(signupOptions))
          .protect(request, { email: body.email, fingerprint: userId });
      }
    } catch {
      // If the body is not JSON or doesn't have an email, fall back to default protection
    }

    return arcjet
      .withRule(detectBot(botOptions))
      .withRule(slidingWindow(rateLimitOptions))
      .protect(request, { fingerprint: userId });
  }

  return arcjet
    .withRule(detectBot(botOptions))
    .protect(request, { fingerprint: userId });
}

export const GET = auth.handler;

export const POST = async (req: NextRequest) => {
  const decision = await protect(req);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      const reset = decision.reason.resetTime;
      let headers: HeadersInit | undefined;
      if (reset instanceof Date) {
        const seconds = Math.max(
          1,
          Math.ceil((reset.getTime() - Date.now()) / 1000),
        );
        headers = {
          "Retry-After": String(seconds),
        };
      }
      return new Response(null, { status: 429, headers });
    } else if (decision.reason.isEmail()) {
      let message: string;

      if (decision.reason.emailTypes.includes("INVALID")) {
        message = "Email address format is invalid. Is there a typo?";
      } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
        message = "We do not allow disposable email addresses";
      } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
        message = "We cannot verify the domain of this email address";
      } else {
        message = "We cannot verify this email address";
      }

      return new Response(JSON.stringify({ error: { message } }), {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      });
    } else {
      return new Response(null, { status: 403 });
    }
  }
  return auth.handler(req);
};
