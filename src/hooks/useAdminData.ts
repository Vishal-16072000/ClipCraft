import { useCallback, useEffect, useState } from "react";
import {
  assignEditorClient,
  createAdminEditor,
  fetchAdminEditors,
  fetchAdminOrders,
  fetchAdminProfiles,
  removeEditorClient,
  type AdminEditor,
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
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
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
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  return { profiles, loading, error, refresh };
}

export function useAdminEditors() {
  const [editors, setEditors] = useState<AdminEditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { editors: data, error: err } = await fetchAdminEditors();
    setEditors(data);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  const createEditor = useCallback(
    async (email: string, password: string) => {
      const result = await createAdminEditor(email, password);

      if (!result.error) {
        await refresh();
      }

      return result;
    },
    [refresh],
  );

  const assignClient = useCallback(
    async (editorId: string, userId: string) => {
      const result = await assignEditorClient(editorId, userId);

      if (!result.error) {
        await refresh();
      }

      return result;
    },
    [refresh],
  );

  const removeClient = useCallback(
    async (editorId: string, userId: string) => {
      const result = await removeEditorClient(editorId, userId);

      if (!result.error) {
        await refresh();
      }

      return result;
    },
    [refresh],
  );

  return { editors, loading, error, refresh, createEditor, assignClient, removeClient };
}
