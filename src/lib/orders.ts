import { supabase } from "./supabase";
import {
  mapEditedVideoComment,
  type EditedVideoComment,
  type EditedVideoCommentRow,
} from "./editedVideoComments";

export const UPLOADS_BUCKET = "uploads";

export type OrderStatus = "received" | "editing" | "review" | "done";

export type OrderFile = {
  id: string;
  name: string;
  size: number;
  storagePath: string;
};

export type EditedVideo = {
  id: string;
  name: string;
  size: number;
  storagePath?: string;
  driveUrl?: string;
  editorId?: string;
  reviewStatus: "pending" | "satisfied" | "changes_requested";
  clientComment?: string;
  comments: EditedVideoComment[];
  createdAt: string;
  reviewedAt?: string;
};

export type Order = {
  id: string;
  userId: string;
  title: string;
  status: OrderStatus;
  files: OrderFile[];
  editedVideos: EditedVideo[];
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
  edited_videos?: Array<{
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
    edited_video_comments?: EditedVideoCommentRow[] | null;
    comments?: EditedVideoCommentRow[] | null;
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
  ),
  edited_videos (
    id,
    name,
    size_bytes,
    storage_path,
    drive_url,
    editor_id,
    review_status,
    client_comment,
    created_at,
    reviewed_at,
    edited_video_comments (
      id,
      author_type,
      author_user_id,
      author_editor_id,
      comment_type,
      body,
      audio_storage_path,
      audio_duration_ms,
      image_storage_path,
      created_at
    )
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

function formatUploadError(fileName: string, message: string) {
  if (message.toLowerCase().includes("maximum allowed size")) {
    return `Upload failed for "${fileName}": Supabase Free projects have a 50MB global upload limit. Use a Google Drive folder link for larger videos, or upgrade the Supabase project and raise the global storage file limit.`;
  }

  return `Upload failed for "${fileName}": ${message}`;
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
    editedVideos: (row.edited_videos ?? []).map((video) => {
      const comments = (video.edited_video_comments ?? video.comments ?? []).map(
        mapEditedVideoComment,
      );

      if (comments.length === 0 && video.client_comment) {
        comments.push({
          id: `legacy-${video.id}`,
          authorType: "client",
          authorUserId: row.user_id,
          commentType: "text",
          body: video.client_comment,
          createdAt: video.reviewed_at ?? video.created_at,
        });
      }

      return {
        id: video.id,
        name: video.name,
        size: Number(video.size_bytes),
        storagePath: video.storage_path ?? undefined,
        driveUrl: video.drive_url ?? undefined,
        editorId: video.editor_id ?? undefined,
        reviewStatus: video.review_status,
        clientComment: video.client_comment ?? undefined,
        comments,
        createdAt: video.created_at,
        reviewedAt: video.reviewed_at ?? undefined,
      };
    }),
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
        error: formatUploadError(file.name, uploadError.message),
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
        error: formatUploadError(file.name, uploadError.message),
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

export async function reviewEditedVideo(
  editedVideoId: string,
  reviewStatus: "satisfied" | "changes_requested",
  input:
    | { commentType: "text"; comment: string }
    | { commentType: "voice"; audioStoragePath: string; audioDurationMs?: number }
    | { commentType: "image"; imageStoragePath: string }
    | { commentType?: "text"; comment?: string } = { commentType: "text", comment: "" },
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const commentType = input.commentType ?? "text";
  const textComment =
    commentType === "text" && "comment" in input ? input.comment?.trim() ?? "" : "";
  const voicePath =
    commentType === "voice" && "audioStoragePath" in input
      ? input.audioStoragePath
      : null;
  const voiceDuration =
    commentType === "voice" && "audioDurationMs" in input
      ? input.audioDurationMs ?? null
      : null;
  const imagePath =
    commentType === "image" && "imageStoragePath" in input ? input.imageStoragePath : null;

  const { error } = await supabase.rpc("client_review_edited_video", {
    target_edited_video_id: editedVideoId,
    next_review_status: reviewStatus,
    review_comment: commentType === "text" ? textComment : null,
    review_comment_type: commentType,
    review_audio_storage_path: voicePath,
    review_audio_duration_ms: voiceDuration,
    review_image_storage_path: imagePath,
  });

  return { error: error?.message ?? null };
}

export function collectEditedVideoStoragePaths(video: EditedVideo): string[] {
  const paths = new Set<string>();

  if (video.storagePath) {
    paths.add(video.storagePath);
  }

  for (const comment of video.comments) {
    if (comment.audioStoragePath) {
      paths.add(comment.audioStoragePath);
    }
    if (comment.imageStoragePath) {
      paths.add(comment.imageStoragePath);
    }
  }

  return [...paths];
}

export async function deleteClientEditedVideo(
  video: EditedVideo,
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const storagePaths = collectEditedVideoStoragePaths(video);
  const { error } = await supabase.rpc("client_delete_edited_video", {
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
