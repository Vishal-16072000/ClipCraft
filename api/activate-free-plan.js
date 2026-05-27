const { activateFreePlan } = require("./lib/razorpay");

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
    const authorizationHeader = req.headers?.authorization ?? req.headers?.Authorization;
    const result = await activateFreePlan({ authorizationHeader });
    res.status(200).json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not activate free plan.";
    console.error("[activate-free-plan]", e);
    res.status(500).json({ success: false, error: message });
  }
};
