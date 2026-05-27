const { createHmac, timingSafeEqual: cryptoTimingSafeEqual } = require("node:crypto");
const { createClient } = require("@supabase/supabase-js");

/** @type {Record<string, { monthly: number; yearly: number | null }>} */
const PLAN_PRICES_INR = {
  starter: { monthly: 999, yearly: 9999 },
  creator: { monthly: 1999, yearly: 19999 },
  pro: { monthly: 3499, yearly: 34999 },
  business: { monthly: 6999, yearly: null },
};

function parseBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;
  const parts = authorizationHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1] ?? null;
}

function addMonths(date, months) {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

function getAmountInPaise(planId, billingCycle) {
  const plan = PLAN_PRICES_INR[planId];
  const inr = billingCycle === "yearly" ? (plan.yearly ?? plan.monthly) : plan.monthly;
  return Math.round(inr * 100);
}

function timingSafeEqual(a, b) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return cryptoTimingSafeEqual(aBuf, bBuf);
}

function verifyRazorpaySignature(params) {
  const { secret, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return timingSafeEqual(expected, razorpaySignature);
}

async function getSupabaseFromAccessToken(accessToken) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured (missing VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY (or *_ANON_KEY)).",
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }

  return { supabase, userId: data.user.id };
}

async function createPendingSubscriptionAndRazorpayOrder(params) {
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error("Razorpay is not configured (missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).");
  }

  const accessToken = parseBearerToken(params.authorizationHeader);
  if (!accessToken) {
    throw new Error("Missing Authorization bearer token.");
  }

  const billingCycle = params.billingCycle;
  const planId = params.planId;

  const validBilling = billingCycle === "monthly" || billingCycle === "yearly";
  const validPlan = Object.prototype.hasOwnProperty.call(PLAN_PRICES_INR, planId);
  if (!validBilling || !validPlan) {
    throw new Error("Invalid plan/billingCycle.");
  }

  const { supabase, userId } = await getSupabaseFromAccessToken(accessToken);

  const planPricing = PLAN_PRICES_INR[planId];
  const effectiveBillingCycle =
    billingCycle === "yearly" && planPricing.yearly === null ? "monthly" : billingCycle;

  const now = new Date();
  const monthsToAdd = effectiveBillingCycle === "yearly" ? 14 : 1;
  const currentPeriodEnd = addMonths(now, monthsToAdd);

  const amountInPaise = getAmountInPaise(planId, effectiveBillingCycle);
  const currency = "INR";
  const receipt = `clipcraft_${planId}_${effectiveBillingCycle}_${String(now.getTime()).slice(-6)}`;

  const basicAuth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");

  const razorpayOrderRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency,
      receipt,
      payment_capture: 1,
      notes: {
        plan_id: planId,
        billing_cycle: effectiveBillingCycle,
        user_id: userId,
      },
    }),
  });

  const razorpayOrderJson = await razorpayOrderRes.json().catch(() => null);

  if (!razorpayOrderRes.ok || !razorpayOrderJson?.id) {
    const razorpayError =
      razorpayOrderJson?.error?.description ?? razorpayOrderJson?.description ?? null;
    throw new Error(
      `Razorpay order creation failed: ${razorpayOrderRes.status} ${razorpayOrderRes.statusText}${
        razorpayError ? ` — ${razorpayError}` : ""
      }`,
    );
  }

  const razorpayOrderId = razorpayOrderJson.id;

  const { error: insertError } = await supabase.from("subscriptions").insert({
    user_id: userId,
    plan_id: planId,
    billing_cycle: effectiveBillingCycle,
    status: "pending",
    amount_in_paise: amountInPaise,
    currency,
    razorpay_order_id: razorpayOrderId,
    current_period_start: now.toISOString(),
    current_period_end: currentPeriodEnd.toISOString(),
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return {
    keyId: razorpayKeyId,
    orderId: razorpayOrderId,
    amountInPaise,
    currency,
  };
}

async function verifyAndActivateSubscription(params) {
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!razorpayKeySecret) {
    throw new Error("Razorpay is not configured (missing RAZORPAY_KEY_SECRET).");
  }

  const accessToken = parseBearerToken(params.authorizationHeader);
  if (!accessToken) {
    throw new Error("Missing Authorization bearer token.");
  }

  const { supabase, userId } = await getSupabaseFromAccessToken(accessToken);

  const ok = verifyRazorpaySignature({
    secret: razorpayKeySecret,
    razorpayOrderId: params.razorpayOrderId,
    razorpayPaymentId: params.razorpayPaymentId,
    razorpaySignature: params.razorpaySignature,
  });

  if (!ok) {
    return { success: false, error: "Invalid Razorpay signature." };
  }

  const { error: updateError } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      razorpay_payment_id: params.razorpayPaymentId,
      razorpay_signature: params.razorpaySignature,
    })
    .eq("razorpay_order_id", params.razorpayOrderId)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { data: updated, error: selectError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("razorpay_order_id", params.razorpayOrderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (!updated) {
    return { success: false, error: "Subscription not found." };
  }

  return { success: true, subscription: updated };
}

async function activateFreePlan(params) {
  const accessToken = parseBearerToken(params.authorizationHeader);
  if (!accessToken) {
    throw new Error("Missing Authorization bearer token.");
  }

  const { supabase, userId } = await getSupabaseFromAccessToken(accessToken);

  const now = new Date();
  const currentPeriodEnd = addMonths(now, 1);
  const razorpayOrderId = `free_${userId}`;

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, status, current_period_end")
    .eq("user_id", userId)
    .eq("plan_id", "free")
    .maybeSingle();

  const existingEndMs = existing?.current_period_end
    ? new Date(existing.current_period_end).getTime()
    : NaN;

  if (
    existing &&
    existing.status === "active" &&
    Number.isFinite(existingEndMs) &&
    existingEndMs > Date.now()
  ) {
    return { success: true, alreadyActive: true };
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        billing_cycle: "monthly",
        status: "active",
        amount_in_paise: 0,
        currency: "INR",
        razorpay_order_id: razorpayOrderId,
        current_period_start: now.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
      })
      .eq("id", existing.id)
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return { success: true, alreadyActive: false };
  }

  const { error: insertError } = await supabase.from("subscriptions").insert({
    user_id: userId,
    plan_id: "free",
    billing_cycle: "monthly",
    status: "active",
    amount_in_paise: 0,
    currency: "INR",
    razorpay_order_id: razorpayOrderId,
    current_period_start: now.toISOString(),
    current_period_end: currentPeriodEnd.toISOString(),
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return { success: true, alreadyActive: false };
}

module.exports = {
  createPendingSubscriptionAndRazorpayOrder,
  verifyAndActivateSubscription,
  activateFreePlan,
};
