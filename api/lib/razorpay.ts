import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

type BillingCycle = "monthly" | "yearly";

type RazorpayPlanId = "starter" | "creator" | "pro" | "business";

const PLAN_PRICES_INR: Record<RazorpayPlanId, { monthly: number; yearly: number | null }> = {
  starter: { monthly: 999, yearly: 9999 },
  creator: { monthly: 1999, yearly: 19999 },
  pro: { monthly: 3499, yearly: 34999 },
  business: { monthly: 6999, yearly: null },
};

function parseBearerToken(authorizationHeader: string | undefined) {
  if (!authorizationHeader) return null;
  const parts = authorizationHeader.split(" ");
  if (parts.length !== 2) return null;
  if (parts[0] !== "Bearer") return null;
  return parts[1] ?? null;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date.getTime());
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  return d;
}

function getAmountInPaise(planId: RazorpayPlanId, billingCycle: BillingCycle) {
  const plan = PLAN_PRICES_INR[planId];
  const inr = billingCycle === "yearly" ? (plan.yearly ?? plan.monthly) : plan.monthly;
  return Math.round(inr * 100);
}

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifyRazorpaySignature(params: {
  secret: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { secret, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return timingSafeEqual(expected, razorpaySignature);
}

async function getSupabaseFromAccessToken(accessToken: string) {
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

export async function createPendingSubscriptionAndRazorpayOrder(params: {
  authorizationHeader: string | undefined;
  planId: string;
  billingCycle: string;
}) {
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error("Razorpay is not configured (missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).");
  }

  const accessToken = parseBearerToken(params.authorizationHeader);
  if (!accessToken) {
    throw new Error("Missing Authorization bearer token.");
  }

  const billingCycle = params.billingCycle as BillingCycle;
  const planId = params.planId as RazorpayPlanId;

  const validBilling = billingCycle === "monthly" || billingCycle === "yearly";
  const validPlan = planId in PLAN_PRICES_INR;
  if (!validBilling || !validPlan) {
    throw new Error("Invalid plan/billingCycle.");
  }

  const { supabase, userId } = await getSupabaseFromAccessToken(accessToken);

  const planPricing = PLAN_PRICES_INR[planId];
  // Business plan has no yearly price in our config, so treat "yearly" selection as monthly.
  const effectiveBillingCycle: BillingCycle =
    billingCycle === "yearly" && planPricing.yearly === null ? "monthly" : billingCycle;

  const now = new Date();
  const monthsToAdd = effectiveBillingCycle === "yearly" ? 14 : 1;
  const currentPeriodEnd = addMonths(now, monthsToAdd);

  const amountInPaise = getAmountInPaise(planId, effectiveBillingCycle);
  const currency = "INR";
  // Razorpay `receipt` length is limited (commonly <= 40 chars). Keep it short & deterministic.
  const receipt = `clipcraft_${planId}_${effectiveBillingCycle}_${String(now.getTime()).slice(-6)}`; // <= ~40 chars

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

  type RazorpayCreateOrderResponse = { id?: string };
  const razorpayOrderJson = (await razorpayOrderRes.json().catch(() => null)) as
    | RazorpayCreateOrderResponse
    | null;

  if (!razorpayOrderRes.ok || !razorpayOrderJson?.id) {
    const razorpayErrorDescription =
      (razorpayOrderJson as { error?: { description?: string } })?.error?.description ??
      (razorpayOrderJson as { description?: string })?.description;

    const razorpayError = typeof razorpayErrorDescription === "string" ? razorpayErrorDescription : null;
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

export async function verifyAndActivateSubscription(params: {
  authorizationHeader: string | undefined;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
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
    return { success: false as const, error: "Invalid Razorpay signature." };
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
    return { success: false as const, error: "Subscription not found." };
  }

  return { success: true as const, subscription: updated };
}

export const razorpayPlanIds = ["starter", "creator", "pro", "business"] as const;
export type { BillingCycle, RazorpayPlanId };

