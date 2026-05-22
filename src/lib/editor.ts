import { supabase } from "./supabase";
import type { OrderFile, OrderStatus } from "./orders";

export type EditorClient = {
  id: string;
  email: string;
  assignedAt: string;
  orderCount: number;
  activeOrderCount: number;
};

export type EditorOrder = {
  id: string;
  userId: string;
  customerEmail: string;
  title: string;
  status: OrderStatus;
  footageUrl?: string;
  referenceUrl?: string;
  styleNotes?: string;
  createdAt: string;
  updatedAt: string;
  files: OrderFile[];
};

type EditorClientRow = {
  id: string;
  email: string;
  assigned_at: string;
  order_count: number;
  active_order_count: number;
};

type EditorOrderRow = {
  id: string;
  user_id: string;
  customer_email: string | null;
  title: string;
  status: OrderStatus;
  footage_url: string | null;
  reference_url: string | null;
  style_notes: string | null;
  created_at: string;
  updated_at: string;
  order_files: Array<{
    id: string;
    name: string;
    size_bytes: number;
    storage_path: string;
  }> | null;
};

function mapEditorClient(row: EditorClientRow): EditorClient {
  return {
    id: row.id,
    email: row.email,
    assignedAt: row.assigned_at,
    orderCount: Number(row.order_count),
    activeOrderCount: Number(row.active_order_count),
  };
}

function mapEditorOrder(row: EditorOrderRow): EditorOrder {
  return {
    id: row.id,
    userId: row.user_id,
    customerEmail: row.customer_email ?? row.user_id,
    title: row.title,
    status: row.status,
    footageUrl: row.footage_url ?? undefined,
    referenceUrl: row.reference_url ?? undefined,
    styleNotes: row.style_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    files: (row.order_files ?? []).map((file) => ({
      id: file.id,
      name: file.name,
      size: Number(file.size_bytes),
      storagePath: file.storage_path,
    })),
  };
}

export async function fetchEditorClients(
  accessToken: string,
): Promise<{ clients: EditorClient[]; error: string | null }> {
  if (!supabase) {
    return { clients: [], error: "Supabase is not configured." };
  }

  const { data, error } = await supabase.rpc("editor_list_clients", {
    editor_token: accessToken,
  });

  if (error) {
    return { clients: [], error: error.message };
  }

  return { clients: (data as EditorClientRow[]).map(mapEditorClient), error: null };
}

export async function fetchEditorOrders(
  accessToken: string,
): Promise<{ orders: EditorOrder[]; error: string | null }> {
  if (!supabase) {
    return { orders: [], error: "Supabase is not configured." };
  }

  const { data, error } = await supabase.rpc("editor_list_orders", {
    editor_token: accessToken,
  });

  if (error) {
    return { orders: [], error: error.message };
  }

  return { orders: (data as EditorOrderRow[]).map(mapEditorOrder), error: null };
}

export async function updateEditorOrderStatus(
  accessToken: string,
  orderId: string,
  status: OrderStatus,
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { error } = await supabase.rpc("editor_update_order_status", {
    editor_token: accessToken,
    order_id: orderId,
    next_status: status,
  });

  return { error: error?.message ?? null };
}
