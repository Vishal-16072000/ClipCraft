import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchActiveSubscriptionForUser, type Subscription } from "../lib/subscriptions";

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { subscription: next, error: err } = await fetchActiveSubscriptionForUser(user.id);
    setSubscription(next);
    setError(err);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onChanged = () => {
      refresh();
    };

    window.addEventListener("clipcraft_subscription_changed", onChanged);
    return () => {
      window.removeEventListener("clipcraft_subscription_changed", onChanged);
    };
  }, [refresh]);

  return { subscription, loading, error, refresh };
}

