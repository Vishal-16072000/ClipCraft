import { createPendingSubscriptionAndRazorpayOrder } from "../lib/razorpay";

type VercelRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

type JsonRecord = Record<string, unknown>;

function getStringBody(body: unknown): JsonRecord {
  // Vercel/Next-style handlers me `req.body` sometimes comes typed as `unknown`.
  // We normalize it into a JSON object record so TS doesn't treat it as plain `object`.
  if (body && typeof body === "object" && !Array.isArray(body)) return body as JsonRecord;
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as JsonRecord;
    } catch {
      return {};
    }
  }
  return {};
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).json(null);
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed." });
    return;
  }

  try {
    const body = getStringBody(req.body);
    const planId = body.planId;
    const billingCycle = body.billingCycle;

    const authorizationHeader = (req.headers?.authorization ??
      req.headers?.Authorization ??
      undefined) as string | undefined;

    if (typeof planId !== "string" || typeof billingCycle !== "string") {
      res.status(400).json({ success: false, error: "Missing planId or billingCycle." });
      return;
    }

    const result = await createPendingSubscriptionAndRazorpayOrder({
      authorizationHeader,
      planId,
      billingCycle,
    });

    res.status(200).json({ success: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create order.";
    res.status(500).json({ success: false, error: message });
  }
}

