import { supabase } from "./supabase";

export const UPLOADS_BUCKET = "uploads";

export type OrderStatus = "received" | "editing" | "review" | "done";

export type OrderFile = {
  id: string;
  name: string;
  size: number;
  storagePath: string;
};

export type Order = {
  id: string;
  userId: string;
  title: string;
  status: OrderStatus;
  files: OrderFile[];
  referenceUrl?: string;
  styleNotes?: string;
  createdAt: string;
  updatedAt: string;
};

type OrderRow = {
  id: string;
  user_id: string;
  title: string;
  status: OrderStatus;
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

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    status: row.status,
    referenceUrl: row.reference_url ?? undefined,
    styleNotes: row.style_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    files: (row.order_files ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      size: Number(f.size_bytes),
      storagePath: f.storage_path,
    })),
  };
}

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 200);
}

export async function fetchOrdersForUser(
  userId: string,
): Promise<{ orders: Order[]; error: string | null }> {
  if (!supabase) {
    return { orders: [], error: "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      title,
      status,
      reference_url,
      style_notes,
      created_at,
      updated_at,
      order_files (
        id,
        name,
        size_bytes,
        storage_path
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { orders: [], error: error.message };
  }

  return {
    orders: (data as OrderRow[]).map(mapOrder),
    error: null,
  };
}

export async function getOrderById(
  userId: string,
  orderId: string,
): Promise<{ order: Order | null; error: string | null }> {
  if (!supabase) {
    return { order: null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      title,
      status,
      reference_url,
      style_notes,
      created_at,
      updated_at,
      order_files (
        id,
        name,
        size_bytes,
        storage_path
      )
    `,
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { order: null, error: error.message };
  }

  if (!data) {
    return { order: null, error: null };
  }

  return { order: mapOrder(data as OrderRow), error: null };
}

export type CreateOrderInput = {
  title: string;
  referenceUrl?: string;
  styleNotes?: string;
};

export async function createOrder(
  userId: string,
  input: CreateOrderInput,
  files: File[],
  onProgress?: (uploaded: number, total: number) => void,
): Promise<{ order: Order | null; error: string | null }> {
  if (!supabase) {
    return { order: null, error: "Supabase is not configured." };
  }

  if (files.length === 0) {
    return { order: null, error: "Add at least one video file." };
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      title: input.title,
      reference_url: input.referenceUrl ?? null,
      style_notes: input.styleNotes ?? null,
      status: "received",
    })
    .select("id")
    .single();

  if (orderError || !orderRow) {
    return { order: null, error: orderError?.message ?? "Failed to create order." };
  }

  const orderId = orderRow.id as string;
  const fileRecords: Array<{
    order_id: string;
    name: string;
    size_bytes: number;
    storage_path: string;
  }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const safeName = sanitizeFileName(file.name);
    const storagePath = `${userId}/${orderId}/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(UPLOADS_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      await supabase.from("orders").delete().eq("id", orderId);
      return {
        order: null,
        error: `Upload failed for "${file.name}": ${uploadError.message}`,
      };
    }

    fileRecords.push({
      order_id: orderId,
      name: file.name,
      size_bytes: file.size,
      storage_path: storagePath,
    });

    onProgress?.(i + 1, files.length);
  }

  const { error: filesError } = await supabase.from("order_files").insert(fileRecords);

  if (filesError) {
    await supabase.storage.from(UPLOADS_BUCKET).remove(fileRecords.map((f) => f.storage_path));
    await supabase.from("orders").delete().eq("id", orderId);
    return { order: null, error: filesError.message };
  }

  return getOrderById(userId, orderId);
}

export async function updateOrderStatus(
  userId: string,
  orderId: string,
  status: OrderStatus,
): Promise<{ order: Order | null; error: string | null }> {
  if (!supabase) {
    return { order: null, error: "Supabase is not configured." };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .eq("user_id", userId);

  if (error) {
    return { order: null, error: error.message };
  }

  return getOrderById(userId, orderId);
}

export async function getSignedFileUrl(
  storagePath: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(UPLOADS_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Received",
  editing: "Editing",
  review: "In Review",
  done: "Delivered",
};

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  "received",
  "editing",
  "review",
  "done",
];
