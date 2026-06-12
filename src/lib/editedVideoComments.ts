import { supabase } from "./supabase";
import { UPLOADS_BUCKET, getSignedFileUrl } from "./orders";

export type CommentViewerRole = "client" | "editor" | "admin";

export type CommentViewerContext = {
  role: CommentViewerRole;
  userId?: string;
  editorId?: string;
};

export type EditedVideoCommentInput =
  | { commentType: "text"; body: string }
  | { commentType: "voice"; audioStoragePath: string; audioDurationMs?: number }
  | { commentType: "image"; imageStoragePath: string };

export type EditedVideoComment = {
  id: string;
  authorType: "client" | "editor" | "admin";
  authorUserId?: string;
  authorEditorId?: string;
  commentType: "text" | "voice" | "image";
  body?: string;
  audioStoragePath?: string;
  audioDurationMs?: number;
  imageStoragePath?: string;
  createdAt: string;
};

export type EditedVideoCommentRow = {
  id: string;
  author_type: "client" | "editor" | "admin";
  author_user_id?: string | null;
  author_editor_id?: string | null;
  comment_type: "text" | "voice" | "image";
  body: string | null;
  audio_storage_path: string | null;
  audio_duration_ms: number | null;
  image_storage_path?: string | null;
  created_at: string;
};

const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_COMMENT_IMAGE_BYTES = 10 * 1024 * 1024;

export function mapEditedVideoComment(row: EditedVideoCommentRow): EditedVideoComment {
  return {
    id: row.id,
    authorType: row.author_type,
    authorUserId: row.author_user_id ?? undefined,
    authorEditorId: row.author_editor_id ?? undefined,
    commentType: row.comment_type,
    body: row.body ?? undefined,
    audioStoragePath: row.audio_storage_path ?? undefined,
    audioDurationMs: row.audio_duration_ms ?? undefined,
    imageStoragePath: row.image_storage_path ?? undefined,
    createdAt: row.created_at,
  };
}

export function isOwnComment(comment: EditedVideoComment, viewer: CommentViewerContext) {
  if (viewer.role === "client" && comment.authorType === "client") {
    return Boolean(viewer.userId && comment.authorUserId && comment.authorUserId === viewer.userId);
  }

  if (viewer.role === "editor" && comment.authorType === "editor") {
    return Boolean(
      viewer.editorId && comment.authorEditorId && comment.authorEditorId === viewer.editorId,
    );
  }

  if (viewer.role === "admin" && comment.authorType === "admin") {
    return Boolean(viewer.userId && comment.authorUserId && comment.authorUserId === viewer.userId);
  }

  return false;
}

export function getCommentAuthorLabel(
  comment: EditedVideoComment,
  viewer: CommentViewerContext,
): string {
  if (isOwnComment(comment, viewer)) {
    return "You";
  }

  if (viewer.role === "client") {
    if (comment.authorType === "editor") return "Editor";
    if (comment.authorType === "admin") return "Admin";
    return "Client";
  }

  if (viewer.role === "editor") {
    if (comment.authorType === "client") return "Client";
    if (comment.authorType === "admin") return "Admin";
    return "Editor";
  }

  if (comment.authorType === "editor") return "Editor";
  if (comment.authorType === "client") return "Client";
  return "Admin";
}

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.-]+/g, "_").slice(0, 200);
}

function buildCommentRpcPayload(input: EditedVideoCommentInput) {
  return {
    next_comment_type: input.commentType,
    comment_body: input.commentType === "text" ? input.body : null,
    comment_audio_storage_path: input.commentType === "voice" ? input.audioStoragePath : null,
    comment_audio_duration_ms: input.commentType === "voice" ? input.audioDurationMs ?? null : null,
    comment_image_storage_path: input.commentType === "image" ? input.imageStoragePath : null,
  };
}

export function validateCommentImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return "Please choose a JPG, PNG, WebP, or GIF image.";
  }

  if (file.size > MAX_COMMENT_IMAGE_BYTES) {
    return "Image must be 10 MB or smaller.";
  }

  return null;
}

export async function uploadCommentAudio(
  editedVideoId: string,
  blob: Blob,
  fileName = "voice-comment.webm",
): Promise<{ storagePath: string | null; error: string | null }> {
  if (!supabase) {
    return { storagePath: null, error: "Supabase is not configured." };
  }

  const storagePath = `comment-audio/${editedVideoId}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
  const { error } = await supabase.storage.from(UPLOADS_BUCKET).upload(storagePath, blob, {
    cacheControl: "3600",
    upsert: false,
    contentType: blob.type || "audio/webm",
  });

  if (error) {
    return { storagePath: null, error: error.message };
  }

  return { storagePath, error: null };
}

export async function uploadCommentImage(
  editedVideoId: string,
  file: File,
): Promise<{ storagePath: string | null; error: string | null }> {
  if (!supabase) {
    return { storagePath: null, error: "Supabase is not configured." };
  }

  const validationError = validateCommentImageFile(file);
  if (validationError) {
    return { storagePath: null, error: validationError };
  }

  const storagePath = `comment-images/${editedVideoId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from(UPLOADS_BUCKET).upload(storagePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    return { storagePath: null, error: error.message };
  }

  return { storagePath, error: null };
}

export async function getCommentMediaUrl(storagePath: string): Promise<string | null> {
  return getSignedFileUrl(storagePath);
}

export async function addClientEditedVideoComment(
  editedVideoId: string,
  input: EditedVideoCommentInput,
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { error } = await supabase.rpc("client_add_edited_video_comment", {
    target_edited_video_id: editedVideoId,
    ...buildCommentRpcPayload(input),
  });

  return { error: error?.message ?? null };
}

export async function addEditorEditedVideoComment(
  editorToken: string,
  editedVideoId: string,
  input: EditedVideoCommentInput,
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { error } = await supabase.rpc("editor_add_edited_video_comment", {
    editor_token: editorToken,
    target_edited_video_id: editedVideoId,
    ...buildCommentRpcPayload(input),
  });

  return { error: error?.message ?? null };
}

export async function addAdminEditedVideoComment(
  editedVideoId: string,
  input: EditedVideoCommentInput,
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { error } = await supabase.rpc("admin_add_edited_video_comment", {
    target_edited_video_id: editedVideoId,
    ...buildCommentRpcPayload(input),
  });

  return { error: error?.message ?? null };
}

async function submitComment(
  editedVideoId: string,
  viewer: CommentViewerContext,
  editorToken: string | undefined,
  input: EditedVideoCommentInput,
): Promise<{ error: string | null }> {
  if (viewer.role === "client") {
    return addClientEditedVideoComment(editedVideoId, input);
  }

  if (viewer.role === "admin") {
    return addAdminEditedVideoComment(editedVideoId, input);
  }

  if (!editorToken) {
    return { error: "Editor session expired. Please sign in again." };
  }

  return addEditorEditedVideoComment(editorToken, editedVideoId, input);
}

export async function addEditedVideoComment(
  editedVideoId: string,
  viewer: CommentViewerContext,
  editorToken: string | undefined,
  input: EditedVideoCommentInput,
): Promise<{ error: string | null }> {
  return submitComment(editedVideoId, viewer, editorToken, input);
}
