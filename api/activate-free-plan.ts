import { activateFreePlan } from "./lib/razorpay";

type VercelRequest = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

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
    const authorizationHeader = (req.headers?.authorization ??
      req.headers?.Authorization ??
      undefined) as string | undefined;

    const result = await activateFreePlan({ authorizationHeader });
    res.status(200).json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not activate free plan.";
    res.status(500).json({ success: false, error: message });
  }
}
