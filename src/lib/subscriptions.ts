import { supabase } from "./supabase";

export type PlanId = "starter" | "creator" | "pro" | "business";
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

