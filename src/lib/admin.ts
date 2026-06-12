import { supabase } from "./supabase";
import { mapEditedVideoComment, type EditedVideoCommentRow } from "./editedVideoComments";
import {
  ORDER_SELECT_WITH_FOOTAGE,
  UPLOADS_BUCKET,
  collectEditedVideoStoragePaths,
  mapOrder,
  type EditedVideo,
  type Order,
  type OrderFile,
  type OrderStatus,
} from "./orders";

export type AdminProfile = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

export type EditorAssignedClient = {
  id: string;
  email: string;
  assignedAt: string;
};

export type AdminEditor = {
  id: string;
  email: string;
  passwordSet: boolean;
  assignedClients: EditorAssignedClient[];
  createdAt: string;
  updatedAt: string;
};

type ProfileRow = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

type AdminEditorRpcRow = {
  id: string;
  email: string;
  password_set: boolean;
  assigned_clients: Array<{
    id: string;
    email: string;
    assigned_at: string;
  }> | null;
  created_at: string;
  updated_at: string;
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
  edited_videos: Array<{
    id: string;
    name: string;
    size_bytes: number;
    storage_path: string | null;
    drive_url: string | null;
    editor_id: string | null;
    review_status: "pending" | "satisfied" | "changes_requested";
    client_comment: string | null;
    created_at: string;
    reviewed_at: string | null;
    comments?: EditedVideoCommentRow[] | null;
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

function mapAdminEditorRpc(row: AdminEditorRpcRow): AdminEditor {
  return {
    id: row.id,
    email: row.email,
    passwordSet: row.password_set,
    assignedClients: (row.assigned_clients ?? []).map((client) => ({
      id: client.id,
      email: client.email,
      assignedAt: client.assigned_at,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
    editedVideos: (row.edited_videos ?? []).map<EditedVideo>((video) => ({
      id: video.id,
      name: video.name,
      size: Number(video.size_bytes),
      storagePath: video.storage_path ?? undefined,
      driveUrl: video.drive_url ?? undefined,
      editorId: video.editor_id ?? undefined,
      reviewStatus: video.review_status,
      clientComment: video.client_comment ?? undefined,
      comments: (video.comments ?? []).map(mapEditedVideoComment),
      createdAt: video.created_at,
      reviewedAt: video.reviewed_at ?? undefined,
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

  await supabase.rpc("admin_sync_profiles");

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

export async function fetchAdminEditors(): Promise<{
  editors: AdminEditor[];
  error: string | null;
}> {
  if (!supabase) {
    return { editors: [], error: "Supabase is not configured." };
  }

  const { data, error } = await supabase.rpc("admin_list_editors");

  if (error) {
    return { editors: [], error: error.message };
  }

  return {
    editors: (data as AdminEditorRpcRow[]).map(mapAdminEditorRpc),
    error: null,
  };
}

export async function createAdminEditor(
  email: string,
  password: string,
): Promise<{ id: string | null; error: string | null }> {
  if (!supabase) {
    return { id: null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase.rpc("admin_create_editor", {
    editor_email: email,
    editor_password: password,
  });

  return { id: (data as string | null) ?? null, error: error?.message ?? null };
}

export async function assignEditorClient(
  editorId: string,
  userId: string,
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { error } = await supabase.rpc("admin_assign_editor_client", {
    target_editor_id: editorId,
    target_user_id: userId,
  });

  return { error: error?.message ?? null };
}

export async function removeEditorClient(
  editorId: string,
  userId: string,
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { error } = await supabase.rpc("admin_remove_editor_client", {
    target_editor_id: editorId,
    target_user_id: userId,
  });

  return { error: error?.message ?? null };
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

export async function deleteAdminOrderFile(
  orderId: string,
  file: OrderFile,
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { error } = await supabase.rpc("admin_delete_order_file", {
    target_order_id: orderId,
    target_file_id: file.id,
  });

  if (error) {
    return { error: error.message };
  }

  await supabase.storage.from(UPLOADS_BUCKET).remove([file.storagePath]);

  return { error: null };
}

export async function deleteAdminEditedVideo(
  video: EditedVideo,
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const storagePaths = collectEditedVideoStoragePaths(video);
  const { error } = await supabase.rpc("admin_delete_edited_video", {
    target_edited_video_id: video.id,
  });

  if (error) {
    return { error: error.message };
  }

  if (storagePaths.length > 0) {
    await supabase.storage.from(UPLOADS_BUCKET).remove(storagePaths);
  }

  return { error: null };
}
