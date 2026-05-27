const { createPendingSubscriptionAndRazorpayOrder } = require("../lib/razorpay");

function getStringBody(body) {
  if (body && typeof body === "object" && !Array.isArray(body)) return body;
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return {};
}

function clientErrorStatus(message) {
  return (
    message.startsWith("Razorpay order creation failed") ||
    message.startsWith("Missing ") ||
    message.startsWith("Invalid ")
  );
}

module.exports = async function handler(req, res) {
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
    const authorizationHeader = req.headers?.authorization ?? req.headers?.Authorization;

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
    console.error("[create-order]", e);
    res.status(clientErrorStatus(message) ? 400 : 500).json({ success: false, error: message });
  }
};
