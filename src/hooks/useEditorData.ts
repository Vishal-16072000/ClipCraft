import { useCallback, useEffect, useState } from "react";
import {
  fetchEditorClients,
  fetchEditorOrders,
  updateEditorOrderStatus,
  uploadEditedVideo,
  type EditorClient,
  type EditorOrder,
} from "../lib/editor";
import type { OrderStatus } from "../lib/orders";

export function useEditorWorkspace(accessToken?: string) {
  const [clients, setClients] = useState<EditorClient[]>([]);
  const [orders, setOrders] = useState<EditorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setClients([]);
      setOrders([]);
      setError("Editor session is missing. Please sign in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    const [clientsResult, ordersResult] = await Promise.all([
      fetchEditorClients(accessToken),
      fetchEditorOrders(accessToken),
    ]);

    setClients(clientsResult.clients);
    setOrders(ordersResult.orders);
    setError(clientsResult.error ?? ordersResult.error);
    setLoading(false);
  }, [accessToken]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      if (!accessToken) {
        return { error: "Editor session is missing. Please sign in again." };
      }

      const result = await updateEditorOrderStatus(accessToken, orderId, status);

      if (!result.error) {
        await refresh();
      }

      return result;
    },
    [accessToken, refresh],
  );

  const uploadEdit = useCallback(
    async (orderId: string, file: File) => {
      if (!accessToken) {
        return { error: "Editor session is missing. Please sign in again." };
      }

      const result = await uploadEditedVideo(accessToken, orderId, file);

      if (!result.error) {
        await refresh();
      }

      return result;
    },
    [accessToken, refresh],
  );

  return { clients, orders, loading, error, refresh, updateStatus, uploadEdit };
}
