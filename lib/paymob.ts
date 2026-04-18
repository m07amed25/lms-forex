import { env } from "./env";
import crypto from "crypto";

type IntentionParams = {
  amount: number;
  currency: string;
  payment_methods: number[];
  items: {
    name: string;
    amount: number;
    description: string;
    quantity: number;
  }[];
  billing_data: {
    apartment?: string;
    email: string;
    floor?: string;
    first_name: string;
    street?: string;
    building?: string;
    phone_number?: string;
    shipping_method?: string;
    postal_code?: string;
    city?: string;
    country?: string;
    last_name: string;
    state?: string;
  };
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
  };
  extras?: Record<string, string>;
  special_reference?: string;
  notification_url?: string;
  redirection_url?: string;
};

export async function createIntention(params: IntentionParams) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch("https://accept.paymob.com/v1/intention/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${env.PAYMOB_SECRET_KEY}`,
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Paymob Intention API Error: ${JSON.stringify(errorData)}`,
      );
    }

    const data = await response.json();
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function buildCheckoutUrl(clientSecret: string) {
  return `https://accept.paymob.com/unifiedcheckout/?publicKey=${env.PAYMOB_PUBLIC_KEY}&clientSecret=${clientSecret}`;
}

export function verifyWebhookHmac(obj: any, hmac: string) {
  const secret = env.PAYMOB_HMAC_SECRET;
  if (!secret) throw new Error("Missing Paymob HMAC Secret");

  const keys = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order.id",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ];

  const objToVal = (o: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], o);
  };

  const str = keys
    .map((key) => {
      const val = objToVal(obj, key);
      if (val === true) return "true";
      if (val === false) return "false";
      return String(val);
    })
    .join("");

  const hash = crypto.createHmac("sha512", secret).update(str).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac));
  } catch (e) {
    return false;
  }
}

export function verifyCallbackHmac(
  searchParams: URLSearchParams,
  hmac: string,
) {
  const secret = env.PAYMOB_HMAC_SECRET;
  if (!secret) throw new Error("Missing Paymob HMAC Secret");

  const keys = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order",
    "owner",
    "pending",
    "source_data_pan",
    "source_data_sub_type",
    "source_data_type",
    "success",
  ];

  const str = keys
    .map((key) => {
      const val = searchParams.get(key);
      if (val === "true") return "true";
      if (val === "false") return "false";
      return String(val ?? "");
    })
    .join("");

  const hash = crypto.createHmac("sha512", secret).update(str).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac));
  } catch (e) {
    return false; // Timing safe equal throws if buffers aren't same length
  }
}
