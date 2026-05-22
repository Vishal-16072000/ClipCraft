import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminOrders,
  fetchAdminProfiles,
  type AdminOrder,
  type AdminProfile,
} from "../lib/admin";

export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { orders: data, error: err } = await fetchAdminOrders();
    setOrders(data);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { orders, loading, error, refresh };
}

export function useAdminProfiles() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { profiles: data, error: err } = await fetchAdminProfiles();
    setProfiles(data);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profiles, loading, error, refresh };
}
