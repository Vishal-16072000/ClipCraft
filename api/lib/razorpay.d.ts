export function createPendingSubscriptionAndRazorpayOrder(params: {
  authorizationHeader: string | undefined;
  planId: string;
  billingCycle: string;
}): Promise<{
  keyId: string;
  orderId: string;
  amountInPaise: number;
  currency: string;
}>;

export function verifyAndActivateSubscription(params: {
  authorizationHeader: string | undefined;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<
  | { success: true; subscription: Record<string, unknown> }
  | { success: false; error: string }
>;

export function activateFreePlan(params: {
  authorizationHeader: string | undefined;
}): Promise<{ success: true; alreadyActive: boolean }>;
