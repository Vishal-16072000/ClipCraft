import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Mic, Send, Square, Trash2 } from "lucide-react";
import {
  addEditedVideoComment,
  getCommentMediaUrl,
  getCommentAuthorLabel,
  isOwnComment,
  uploadCommentAudio,
  uploadCommentImage,
  validateCommentImageFile,
  type CommentViewerContext,
  type EditedVideoComment,
} from "../../lib/editedVideoComments";
import { formatDuration, useVoiceRecorder } from "../../hooks/useVoiceRecorder";

function formatCommentDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function VoiceCommentPlayer({
  storagePath,
  durationMs,
}: {
  storagePath: string;
  durationMs?: number;
}) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getCommentMediaUrl(storagePath).then((url) => {
      if (cancelled) return;
      setAudioUrl(url);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [storagePath]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading voice note...
      </div>
    );
  }

  if (!audioUrl) {
    return <p className="text-xs text-gray-500">Voice note unavailable.</p>;
  }

  return (
    <div className="space-y-1">
      <audio controls preload="metadata" src={audioUrl} className="w-full" />
      {durationMs ? (
        <p className="text-[11px] text-gray-500">Duration: {formatDuration(durationMs)}</p>
      ) : null}
    </div>
  );
}

function ImageCommentPreview({ storagePath }: { storagePath: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getCommentMediaUrl(storagePath).then((url) => {
      if (cancelled) return;
      setImageUrl(url);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [storagePath]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading image...
      </div>
    );
  }

  if (!imageUrl) {
    return <p className="text-xs text-gray-500">Image unavailable.</p>;
  }

  return (
    <a href={imageUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl">
      <img
        src={imageUrl}
        alt="Comment attachment"
        className="max-h-64 w-full object-contain bg-black/30"
      />
    </a>
  );
}

function CommentBubble({
  comment,
  viewer,
}: {
  comment: EditedVideoComment;
  viewer: CommentViewerContext;
}) {
  const own = isOwnComment(comment, viewer);
  const authorLabel = getCommentAuthorLabel(comment, viewer);

  return (
    <div
      className={`rounded-2xl border px-3 py-2 ${
        own
          ? "border-brand-500/20 bg-brand-500/10"
          : "border-white/10 bg-surface-900/50"
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {authorLabel}
        </span>
        <span className="text-[11px] text-gray-500">{formatCommentDate(comment.createdAt)}</span>
      </div>
      {comment.commentType === "text" ? (
        <p className="whitespace-pre-wrap text-sm text-gray-200">{comment.body}</p>
      ) : comment.commentType === "voice" && comment.audioStoragePath ? (
        <VoiceCommentPlayer
          storagePath={comment.audioStoragePath}
          durationMs={comment.audioDurationMs}
        />
      ) : comment.commentType === "image" && comment.imageStoragePath ? (
        <ImageCommentPreview storagePath={comment.imageStoragePath} />
      ) : null}
    </div>
  );
}

type ReviewCommentInput =
  | { commentType: "text"; comment: string }
  | { commentType: "voice"; audioStoragePath: string; audioDurationMs?: number }
  | { commentType: "image"; imageStoragePath: string }
  | null;

export function EditedVideoCommentThread({
  editedVideoId,
  comments,
  viewer,
  editorToken,
  onChanged,
  showReplyForm = true,
  compact = false,
  onReview,
  reviewing = null,
}: {
  editedVideoId: string;
  comments: EditedVideoComment[];
  viewer: CommentViewerContext;
  editorToken?: string;
  onChanged?: () => void | Promise<void>;
  showReplyForm?: boolean;
  compact?: boolean;
  onReview?: (
    status: "satisfied" | "changes_requested",
    input: ReviewCommentInput,
  ) => void | Promise<void>;
  reviewing?: "satisfied" | "changes_requested" | null;
}) {
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const voice = useVoiceRecorder();

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function clearSelectedImage() {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const validationError = validateCommentImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    clearSelectedImage();
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  async function submitTextReply() {
    const body = replyText.trim();
    if (!body) {
      setError("Write a comment before sending.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await addEditedVideoComment(editedVideoId, viewer, editorToken, {
      commentType: "text",
      body,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setReplyText("");
    await onChanged?.();
  }

  async function buildPendingReviewInput(): Promise<ReviewCommentInput> {
    const body = replyText.trim();
    if (body) {
      return { commentType: "text", comment: body };
    }

    if (selectedImage) {
      const upload = await uploadCommentImage(editedVideoId, selectedImage);
      if (upload.error || !upload.storagePath) {
        throw new Error(upload.error ?? "Image upload failed.");
      }
      return { commentType: "image", imageStoragePath: upload.storagePath };
    }

    const blob = voice.getRecordedBlob();
    if (!blob) {
      return null;
    }

    const upload = await uploadCommentAudio(editedVideoId, blob);
    if (upload.error || !upload.storagePath) {
      throw new Error(upload.error ?? "Voice upload failed.");
    }

    return {
      commentType: "voice",
      audioStoragePath: upload.storagePath,
      audioDurationMs: voice.durationMs,
    };
  }

  async function handleReview(status: "satisfied" | "changes_requested") {
    if (!onReview) return;

    setSubmitting(true);
    setError(null);

    try {
      const pendingInput = await buildPendingReviewInput();
      await onReview(status, pendingInput);
      setReplyText("");
      voice.resetRecording();
      clearSelectedImage();
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Review failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitVoiceReply() {
    const blob = voice.getRecordedBlob();
    if (!blob) {
      setError("Record a voice note before sending.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const upload = await uploadCommentAudio(editedVideoId, blob);

    if (upload.error || !upload.storagePath) {
      setSubmitting(false);
      setError(upload.error ?? "Voice upload failed.");
      return;
    }

    const result = await addEditedVideoComment(editedVideoId, viewer, editorToken, {
      commentType: "voice",
      audioStoragePath: upload.storagePath,
      audioDurationMs: voice.durationMs,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    voice.resetRecording();
    await onChanged?.();
  }

  async function submitImageReply() {
    if (!selectedImage) {
      setError("Choose an image before sending.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const upload = await uploadCommentImage(editedVideoId, selectedImage);

    if (upload.error || !upload.storagePath) {
      setSubmitting(false);
      setError(upload.error ?? "Image upload failed.");
      return;
    }

    const result = await addEditedVideoComment(editedVideoId, viewer, editorToken, {
      commentType: "image",
      imageStoragePath: upload.storagePath,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    clearSelectedImage();
    await onChanged?.();
  }

  const hasPendingAttachment = Boolean(selectedImage) || voice.state !== "idle";
  const hasComments = comments.length > 0;

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="space-y-2">
        {hasComments ? (
          comments.map((comment) => (
            <CommentBubble key={comment.id} comment={comment} viewer={viewer} />
          ))
        ) : (
          <p className="text-xs text-gray-500">No comments yet. Start the conversation below.</p>
        )}
      </div>

      {showReplyForm ? (
        <div className="space-y-2 border-t border-white/10 pt-3">
          <textarea
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            rows={compact ? 2 : 3}
            placeholder={
              viewer.role === "client"
                ? "Reply to your editor..."
                : viewer.role === "admin"
                  ? "Reply to the client and editor..."
                  : "Reply to your client..."
            }
            disabled={submitting || voice.state === "recording"}
            className="w-full resize-none rounded-xl border border-white/10 bg-surface-800 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-brand-400 disabled:opacity-60"
          />

          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageSelect}
          />

          {voice.state === "recording" ? (
            <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                Recording {formatDuration(voice.durationMs)}
              </span>
              <button
                type="button"
                onClick={voice.stopRecording}
                className="inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-2 py-1 font-semibold text-red-100"
              >
                <Square className="h-3 w-3" />
                Stop
              </button>
            </div>
          ) : null}

          {voice.state === "recorded" && voice.previewUrl ? (
            <div className="space-y-2 rounded-xl border border-white/10 bg-surface-900/60 p-3">
              <audio controls src={voice.previewUrl} className="w-full" />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={submitVoiceReply}
                  disabled={submitting}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand-500/20 px-3 py-1.5 text-xs font-semibold text-brand-100 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Send voice note
                </button>
                <button
                  type="button"
                  onClick={voice.resetRecording}
                  disabled={submitting}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Discard
                </button>
              </div>
            </div>
          ) : null}

          {selectedImage && imagePreviewUrl ? (
            <div className="space-y-2 rounded-xl border border-white/10 bg-surface-900/60 p-3">
              <img
                src={imagePreviewUrl}
                alt={selectedImage.name}
                className="max-h-48 w-full rounded-lg object-contain bg-black/30"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={submitImageReply}
                  disabled={submitting}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand-500/20 px-3 py-1.5 text-xs font-semibold text-brand-100 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Send image
                </button>
                <button
                  type="button"
                  onClick={clearSelectedImage}
                  disabled={submitting}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Discard
                </button>
              </div>
            </div>
          ) : null}

          {(voice.error || error) && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {voice.error ?? error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={submitTextReply}
              disabled={
                submitting || !replyText.trim() || voice.state === "recording" || hasPendingAttachment
              }
              className="inline-flex items-center gap-1 rounded-xl bg-brand-500/20 px-3 py-2 text-xs font-semibold text-brand-100 transition-colors hover:bg-brand-500/30 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Send reply
            </button>
            {voice.state === "idle" && !selectedImage ? (
              <>
                <button
                  type="button"
                  onClick={voice.startRecording}
                  disabled={submitting}
                  className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-gray-200 transition-colors hover:border-brand-400/40 hover:text-white disabled:opacity-50"
                >
                  <Mic className="h-3.5 w-3.5" />
                  Record voice
                </button>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={submitting}
                  className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-gray-200 transition-colors hover:border-brand-400/40 hover:text-white disabled:opacity-50"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  Add image
                </button>
              </>
            ) : null}
          </div>

          {onReview ? (
            <div className="flex flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleReview("satisfied")}
                disabled={submitting || reviewing !== null || voice.state === "recording"}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/25 disabled:opacity-50"
              >
                {reviewing === "satisfied" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Satisfied
              </button>
              <button
                type="button"
                onClick={() => handleReview("changes_requested")}
                disabled={submitting || reviewing !== null || voice.state === "recording"}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/25 disabled:opacity-50"
              >
                {reviewing === "changes_requested" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                Request changes
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
