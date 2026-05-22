import { supabase } from "./supabase";
import {
  ORDER_SELECT_WITH_FOOTAGE,
  mapOrder,
  type Order,
  type OrderFile,
  type OrderStatus,
} from "./orders";

export type AdminProfile = {
  id: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
};

type ProfileRow = {
  id: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
};

type AdminOrderRpcRow = {
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

export type AdminOrder = Order & {
  customerEmail?: string;
};

function mapProfile(row: ProfileRow): AdminProfile {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

function mapAdminOrderRpc(row: AdminOrderRpcRow): AdminOrder {
  return {
    id: row.id,
    userId: row.user_id,
    customerEmail: row.customer_email ?? undefined,
    title: row.title,
    status: row.status,
    footageUrl: row.footage_url ?? undefined,
    referenceUrl: row.reference_url ?? undefined,
    styleNotes: row.style_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    files: (row.order_files ?? []).map<OrderFile>((file) => ({
      id: file.id,
      name: file.name,
      size: Number(file.size_bytes),
      storagePath: file.storage_path,
    })),
  };
}

export async function fetchAdminProfiles(): Promise<{
  profiles: AdminProfile[];
  error: string | null;
}> {
  if (!supabase) {
    return { profiles: [], error: "Supabase is not configured." };
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc("admin_list_profiles");

  if (!rpcError) {
    return { profiles: (rpcData as ProfileRow[]).map(mapProfile), error: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { profiles: [], error: error.message };
  }

  return { profiles: (data as ProfileRow[]).map(mapProfile), error: null };
}

export async function fetchAdminOrders(): Promise<{
  orders: AdminOrder[];
  error: string | null;
}> {
  if (!supabase) {
    return { orders: [], error: "Supabase is not configured." };
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc("admin_list_orders");

  if (!rpcError) {
    return {
      orders: (rpcData as AdminOrderRpcRow[]).map(mapAdminOrderRpc),
      error: null,
    };
  }

  const [{ data: ordersData, error: ordersError }, profilesResult] = await Promise.all([
    supabase
      .from("orders")
      .select(ORDER_SELECT_WITH_FOOTAGE)
      .order("created_at", { ascending: false }),
    fetchAdminProfiles(),
  ]);

  if (ordersError) {
    return { orders: [], error: ordersError.message };
  }

  if (profilesResult.error) {
    return { orders: [], error: profilesResult.error };
  }

  const emailByUserId = new Map(
    profilesResult.profiles.map((profile) => [profile.id, profile.email]),
  );

  return {
    orders: ordersData.map((row) => ({
      ...mapOrder(row),
      customerEmail: emailByUserId.get(row.user_id),
    })),
    error: null,
  };
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { error: rpcError } = await supabase.rpc("admin_update_order_status", {
    order_id: orderId,
    next_status: status,
  });

  if (!rpcError) {
    return { error: null };
  }

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  return { error: error?.message ?? null };
}
