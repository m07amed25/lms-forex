import "server-only";

import arcjet, {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  shield,
  slidingWindow,
} from "@arcjet/next";
import { env } from "./env";

export {
  detectBot,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  shield,
  slidingWindow,
};

const noopArcjet = {
  withRule() {
    return this;
  },
  async protect() {
    return {
      conclusion: "ALLOW",
      isDenied: () => false,
      reason: {
        isRateLimit: () => false,
        isEmail: () => false,
        isBot: () => false,
        emailTypes: [] as string[],
      },
    };
  },
};

const createArcjetClient = (key: string) =>
  arcjet({
    key,
    characteristics: ["fingerprint"],
    // base rules
    rules: [
      shield({
        mode: "LIVE",
      }),
    ],
  });

type ArcjetClient = ReturnType<typeof createArcjetClient>;

const arcjetClient: ArcjetClient = env.ARCJET_KEY
  ? createArcjetClient(env.ARCJET_KEY)
  : (noopArcjet as unknown as ArcjetClient);

if (!env.ARCJET_KEY && process.env.NODE_ENV !== "test") {
  console.warn("[Arcjet] ARCJET_KEY is missing. Arcjet checks are disabled.");
}

export default arcjetClient;
