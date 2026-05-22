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
  footageUrl?: string;
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
  footage_url?: string | null;
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

export const ORDER_SELECT_WITH_FOOTAGE = `
  id,
  user_id,
  title,
  status,
  footage_url,
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
`;

const ORDER_SELECT_LEGACY = `
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
`;

function isMissingFootageUrlError(message: string) {
  return message.includes("orders.footage_url") || message.includes("footage_url");
}

export function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    status: row.status,
    footageUrl: row.footage_url ?? undefined,
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
  return name.replace(/[^\w.-]+/g, "_").slice(0, 200);
}

function createStoragePath(userId: string, orderId: string, fileName: string) {
  const safeName = sanitizeFileName(fileName);
  return `${userId}/${orderId}/${crypto.randomUUID()}-${safeName}`;
}

export async function fetchOrdersForUser(
  userId: string,
): Promise<{ orders: Order[]; error: string | null }> {
  if (!supabase) {
    return { orders: [], error: "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT_WITH_FOOTAGE)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingFootageUrlError(error.message)) {
      const { data: legacyData, error: legacyError } = await supabase
        .from("orders")
        .select(ORDER_SELECT_LEGACY)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (legacyError) {
        return { orders: [], error: legacyError.message };
      }

      return {
        orders: (legacyData as OrderRow[]).map(mapOrder),
        error: null,
      };
    }

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
    .select(ORDER_SELECT_WITH_FOOTAGE)
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingFootageUrlError(error.message)) {
      const { data: legacyData, error: legacyError } = await supabase
        .from("orders")
        .select(ORDER_SELECT_LEGACY)
        .eq("id", orderId)
        .eq("user_id", userId)
        .maybeSingle();

      if (legacyError) {
        return { order: null, error: legacyError.message };
      }

      if (!legacyData) {
        return { order: null, error: null };
      }

      return { order: mapOrder(legacyData as OrderRow), error: null };
    }

    return { order: null, error: error.message };
  }

  if (!data) {
    return { order: null, error: null };
  }

  return { order: mapOrder(data as OrderRow), error: null };
}

export type CreateOrderInput = {
  title: string;
  footageUrl?: string;
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

  if (files.length === 0 && !input.footageUrl) {
    return {
      order: null,
      error: "Upload video files or add a Google Drive folder link.",
    };
  }

  const orderPayload: {
    user_id: string;
    title: string;
    footage_url?: string;
    reference_url: string | null;
    style_notes: string | null;
    status: OrderStatus;
  } = {
    user_id: userId,
    title: input.title,
    reference_url: input.referenceUrl ?? null,
    style_notes: input.styleNotes ?? null,
    status: "received",
  };

  if (input.footageUrl) {
    orderPayload.footage_url = input.footageUrl;
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("id")
    .single();

  if (orderError || !orderRow) {
    if (orderError && input.footageUrl && isMissingFootageUrlError(orderError.message)) {
      return {
        order: null,
        error:
          "Google Drive links need the latest Supabase migration. Please apply the footage_url migration, then try again.",
      };
    }

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
    const storagePath = createStoragePath(userId, orderId, file.name);

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

  if (fileRecords.length === 0) {
    return getOrderById(userId, orderId);
  }

  const { error: filesError } = await supabase.from("order_files").insert(fileRecords);

  if (filesError) {
    await supabase.storage.from(UPLOADS_BUCKET).remove(fileRecords.map((f) => f.storage_path));
    await supabase.from("orders").delete().eq("id", orderId);
    return { order: null, error: filesError.message };
  }

  return getOrderById(userId, orderId);
}

export async function addOrderFiles(
  userId: string,
  orderId: string,
  files: File[],
  onProgress?: (uploaded: number, total: number) => void,
): Promise<{ order: Order | null; error: string | null }> {
  if (!supabase) {
    return { order: null, error: "Supabase is not configured." };
  }

  const videoFiles = files.filter((file) => file.type.startsWith("video/"));

  if (videoFiles.length === 0) {
    return { order: null, error: "Choose at least one video file." };
  }

  const fileRecords: Array<{
    order_id: string;
    name: string;
    size_bytes: number;
    storage_path: string;
  }> = [];

  for (let i = 0; i < videoFiles.length; i++) {
    const file = videoFiles[i];
    const storagePath = createStoragePath(userId, orderId, file.name);

    const { error: uploadError } = await supabase.storage
      .from(UPLOADS_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      await supabase.storage
        .from(UPLOADS_BUCKET)
        .remove(fileRecords.map((record) => record.storage_path));
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

    onProgress?.(i + 1, videoFiles.length);
  }

  const { error: filesError } = await supabase.from("order_files").insert(fileRecords);

  if (filesError) {
    await supabase.storage
      .from(UPLOADS_BUCKET)
      .remove(fileRecords.map((record) => record.storage_path));
    return { order: null, error: filesError.message };
  }

  return getOrderById(userId, orderId);
}

export async function deleteOrderFile(
  userId: string,
  orderId: string,
  file: OrderFile,
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { data: deletedFile, error: fileError } = await supabase
    .from("order_files")
    .delete()
    .eq("id", file.id)
    .eq("order_id", orderId)
    .select("id")
    .maybeSingle();

  if (fileError) {
    return {
      error: `Could not remove "${file.name}" from this order: ${fileError.message}`,
    };
  }

  if (!deletedFile) {
    return {
      error:
        "Delete permission is not enabled in Supabase yet. Run the order_files delete policy migration, then try again.",
    };
  }

  await supabase
    .from("orders")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("user_id", userId);

  await supabase.storage.from(UPLOADS_BUCKET).remove([file.storagePath]);

  return { error: null };
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
