import { supabase } from "./supabase";

export const PENDING_SUBSCRIPTION_KEY = "clipcraft_pending_subscription";

export type PlanId = "free" | "starter" | "creator" | "pro" | "business";
export type BillingCycle = "monthly" | "yearly";
export type SubscriptionStatus = "pending" | "active" | "cancelled" | "failed";

export type Subscription = {
  id: string;
  userId: string;
  planId: PlanId;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  amountInPaise: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  amount_in_paise: number;
  currency: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
};

const PLAN_TOTAL_EDITS_MONTHLY: Record<PlanId, number | null> = {
  free: 2,
  starter: 4,
  creator: 8,
  pro: 15,
  business: null, // unlimited
};

export function getTotalEdits(planId: PlanId, billingCycle: BillingCycle) {
  const monthly = PLAN_TOTAL_EDITS_MONTHLY[planId];
  if (monthly === null) return null;

  // "Annual = 2 months free" => treat as 14 months service.
  return billingCycle === "yearly" ? monthly * 14 : monthly;
}

export function getPlanDisplayName(planId: PlanId) {
  const map: Record<PlanId, string> = {
    free: "Free Plan",
    starter: "Starter",
    creator: "Creator",
    pro: "Pro",
    business: "Business",
  };
  return map[planId];
}

function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id as PlanId,
    billingCycle: row.billing_cycle,
    status: row.status,
    amountInPaise: row.amount_in_paise,
    currency: row.currency,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    razorpaySignature: row.razorpay_signature,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchActiveSubscriptionForUser(userId: string): Promise<{
  subscription: Subscription | null;
  error: string | null;
}> {
  if (!supabase) {
    return { subscription: null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { subscription: null, error: error.message };
  }

  if (!data) {
    return { subscription: null, error: null };
  }

  const end = new Date(data.current_period_end).getTime();
  if (Number.isNaN(end) || end <= Date.now()) {
    return { subscription: null, error: null };
  }

  return { subscription: mapSubscription(data as SubscriptionRow), error: null };
}

function addMonths(date: Date, months: number) {
  const next = new Date(date.getTime());
  next.setMonth(next.getMonth() + months);
  return next;
}

function freePlanOrderId(userId: string) {
  return `free_${userId}`;
}

export function hasPendingFreePlanIntent() {
  if (typeof window === "undefined") return false;

  try {
    const raw = window.localStorage.getItem(PENDING_SUBSCRIPTION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { planId?: string };
    return parsed.planId === "free";
  } catch {
    return false;
  }
}

export function clearPendingFreePlanIntent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PENDING_SUBSCRIPTION_KEY);
}

export function setPendingFreePlanIntent() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    PENDING_SUBSCRIPTION_KEY,
    JSON.stringify({ planId: "free", billingCycle: "monthly" }),
  );
}

export async function activateFreePlanForUser(userId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  if (!supabase) {
    return { success: false, error: "Supabase is not configured." };
  }

  const { subscription: active } = await fetchActiveSubscriptionForUser(userId);
  if (active) {
    return { success: true, error: null };
  }

  const now = new Date();
  const currentPeriodEnd = addMonths(now, 1);
  const razorpayOrderId = freePlanOrderId(userId);

  const { data: existingFree, error: selectError } = await supabase
    .from("subscriptions")
    .select("id, status, current_period_end")
    .eq("user_id", userId)
    .eq("plan_id", "free")
    .maybeSingle();

  if (selectError) {
    return { success: false, error: selectError.message };
  }

  if (existingFree?.id) {
    const endMs = new Date(existingFree.current_period_end).getTime();
    if (
      existingFree.status === "active" &&
      Number.isFinite(endMs) &&
      endMs > Date.now()
    ) {
      return { success: true, error: null };
    }

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
      .eq("id", existingFree.id)
      .eq("user_id", userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, error: null };
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
    return { success: false, error: insertError.message };
  }

  return { success: true, error: null };
}

export async function activatePendingFreePlanIfNeeded(userId: string): Promise<{
  activated: boolean;
  error: string | null;
}> {
  if (!hasPendingFreePlanIntent()) {
    return { activated: false, error: null };
  }

  const result = await activateFreePlanForUser(userId);
  if (!result.success) {
    return { activated: false, error: result.error };
  }

  clearPendingFreePlanIntent();
  return { activated: true, error: null };
}

