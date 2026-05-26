import { verifyAndActivateSubscription } from "../lib/razorpay";

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

function getStringBody(body: unknown) {
  if (body && typeof body === "object") return body as Record<string, unknown>;
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as Record<string, unknown>;
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
    const authorizationHeader = (req.headers?.authorization ??
      req.headers?.Authorization ??
      undefined) as string | undefined;

    const razorpayOrderId = body.razorpay_order_id;
    const razorpayPaymentId = body.razorpay_payment_id;
    const razorpaySignature = body.razorpay_signature;

    if (typeof razorpayOrderId !== "string" || typeof razorpayPaymentId !== "string" || typeof razorpaySignature !== "string") {
      res.status(400).json({ success: false, error: "Missing payment verification fields." });
      return;
    }

    const result = await verifyAndActivateSubscription({
      authorizationHeader,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not verify payment.";
    res.status(500).json({ success: false, error: message });
  }
}

