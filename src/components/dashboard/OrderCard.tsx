import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileVideo,
  ChevronRight,
  Clock,
  FolderOpen,
  Loader2,
  Link2,
  PlayCircle,
  Plus,
  Trash2,
} from "lucide-react";
import {
  addOrderFiles,
  deleteOrderFile,
  getSignedFileUrl,
  reviewEditedVideo,
  type EditedVideo,
  type Order,
  type OrderFile,
} from "../../lib/orders";
import { StatusBadge } from "./StatusBadge";
import { PipelineProgress } from "./PipelineProgress";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const totalSize = (order: Order) =>
  order.files.reduce((sum, f) => sum + f.size, 0);

function footageSummary(order: Order) {
  if (order.files.length > 0) {
    return `${order.files.length} video${order.files.length !== 1 ? "s" : ""} · ${formatSize(
      totalSize(order),
    )}`;
  }

  return order.footageUrl ? "Google Drive folder" : "No footage attached";
}

function UploadedVideoPlayer({
  file,
  removing,
  onRemove,
}: {
  file: OrderFile;
  removing: boolean;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState<{
    storagePath: string;
    signedUrl: string | null;
  } | null>(null);
  const loading = preview?.storagePath !== file.storagePath;
  const signedUrl = loading ? null : preview.signedUrl;

  useEffect(() => {
    let cancelled = false;

    getSignedFileUrl(file.storagePath).then((url) => {
      if (cancelled) return;
      setPreview({ storagePath: file.storagePath, signedUrl: url });
    });

    return () => {
      cancelled = true;
    };
  }, [file.storagePath]);

  return (
    <li className="overflow-hidden rounded-2xl border border-white/10 bg-surface-700/50">
      <div className="relative aspect-video bg-black">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : signedUrl ? (
          <video
            src={signedUrl}
            controls
            preload="metadata"
            className="h-full w-full object-contain"
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-xs text-gray-500">
            <PlayCircle className="h-7 w-7 text-gray-600" />
            Preview unavailable
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <FileVideo className="h-5 w-5 shrink-0 text-brand-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-white">{file.name}</p>
          <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
          aria-label={`Remove ${file.name}`}
          title="Remove clip"
        >
          {removing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </li>
  );
}

function EditedVideoReview({
  video,
  onReviewed,
}: {
  video: EditedVideo;
  onReviewed?: () => void | Promise<void>;
}) {
  const [preview, setPreview] = useState<{
    storagePath: string;
    signedUrl: string | null;
  } | null>(null);
  const [comment, setComment] = useState(video.clientComment ?? "");
  const [reviewing, setReviewing] = useState<"satisfied" | "changes_requested" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loading = Boolean(video.storagePath) && preview?.storagePath !== video.storagePath;
  const signedUrl = loading ? null : preview?.signedUrl;

  useEffect(() => {
    if (!video.storagePath) {
      return;
    }

    let cancelled = false;

    const storagePath = video.storagePath;
    if (!storagePath) return;

    getSignedFileUrl(storagePath).then((url) => {
      if (cancelled) return;
      setPreview({ storagePath, signedUrl: url });
    });

    return () => {
      cancelled = true;
    };
  }, [video.storagePath]);

  async function handleReview(nextStatus: "satisfied" | "changes_requested") {
    setError(null);
    setReviewing(nextStatus);
    const result = await reviewEditedVideo(video.id, nextStatus, comment.trim());
    setReviewing(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    await onReviewed?.();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-700/50">
      {video.driveUrl ? (
        <a
          href={video.driveUrl}
          target="_blank"
          rel="noreferrer"
          className="flex aspect-video flex-col items-center justify-center gap-3 bg-surface-900/80 px-4 text-center transition-colors hover:bg-surface-900"
        >
          <Link2 className="h-8 w-8 text-brand-400" />
          <span className="text-sm font-medium text-white">Open edited video on Google Drive</span>
          <span className="line-clamp-2 text-xs text-gray-500">{video.driveUrl}</span>
        </a>
      ) : (
        <div className="relative aspect-video bg-black">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : signedUrl ? (
            <video src={signedUrl} controls preload="metadata" className="h-full w-full object-contain">
              Your browser does not support video playback.
            </video>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-xs text-gray-500">
              <PlayCircle className="h-7 w-7 text-gray-600" />
              Preview unavailable
            </div>
          )}
        </div>
      )}
      <div className="space-y-3 px-4 py-3">
        <div>
          <p className="truncate text-sm font-medium text-white">{video.name}</p>
          <p className="text-xs text-gray-500">
            {video.driveUrl ? "Google Drive link" : formatSize(video.size)} ·{" "}
            {video.reviewStatus.replace("_", " ")}
          </p>
        </div>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          placeholder="Add a comment for your editor"
          className="w-full resize-none rounded-xl border border-white/10 bg-surface-800 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-brand-400"
        />
        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => handleReview("satisfied")}
            disabled={reviewing !== null}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/25 disabled:opacity-50"
          >
            {reviewing === "satisfied" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Satisfied
          </button>
          <button
            type="button"
            onClick={() => handleReview("changes_requested")}
            disabled={reviewing !== null}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/25 disabled:opacity-50"
          >
            {reviewing === "changes_requested" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Request changes
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrderCard({
  order,
  compact = false,
  onChanged,
}: {
  order: Order;
  compact?: boolean;
  onChanged?: () => void | Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [removingFileId, setRemovingFileId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleAddClips(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).filter((file) =>
      file.type.startsWith("video/"),
    );
    e.target.value = "";

    if (selected.length === 0 || adding) return;

    setActionError(null);
    setAdding(true);
    const { error } = await addOrderFiles(order.userId, order.id, selected);
    setAdding(false);

    if (error) {
      setActionError(error);
      return;
    }

    await onChanged?.();
  }

  async function handleRemoveClip(file: OrderFile) {
    if (removingFileId) return;

    const shouldRemove = window.confirm(`Remove "${file.name}" from this order?`);
    if (!shouldRemove) return;

    setActionError(null);
    setRemovingFileId(file.id);
    const { error } = await deleteOrderFile(order.userId, order.id, file);
    setRemovingFileId(null);

    if (error) {
      setActionError(error);
      return;
    }

    await onChanged?.();
  }

  if (compact) {
    return (
      <Link
        to="/dashboard/orders"
        className="glass rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.05] transition-colors group"
      >
        <div className="h-11 w-11 rounded-xl bg-brand-600/20 flex items-center justify-center shrink-0">
          <FileVideo className="h-5 w-5 text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{order.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {order.files.length > 0
              ? `${order.files.length} file${order.files.length !== 1 ? "s" : ""}`
              : "Drive folder"}{" "}
            ·{" "}
            {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
        <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-gray-400 shrink-0" />
      </Link>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-600/20 flex items-center justify-center shrink-0">
            <FileVideo className="h-6 w-6 text-brand-400" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">{order.title}</h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Submitted {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <PipelineProgress status={order.status} />

      <div className="mt-5 pt-5 border-t border-white/10 space-y-5 text-sm">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                Files
              </p>
              <p className="text-white">{footageSummary(order)}</p>
            </div>
            <label
              className={`inline-flex w-fit items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                adding
                  ? "cursor-not-allowed bg-white/5 text-gray-500"
                  : "cursor-pointer bg-brand-600/20 text-brand-300 hover:bg-brand-600/30 hover:text-white"
              }`}
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {adding ? "Adding..." : "Add clips"}
              <input
                type="file"
                accept="video/*"
                multiple
                disabled={adding}
                className="hidden"
                onChange={handleAddClips}
              />
            </label>
          </div>
          {actionError && (
            <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {actionError}
            </p>
          )}
          {order.footageUrl && (
            <a
              href={order.footageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-700/50 px-4 py-3 text-sm text-brand-300 transition-colors hover:border-brand-500/40 hover:bg-brand-600/10 hover:text-white"
            >
              <FolderOpen className="h-5 w-5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{order.footageUrl}</span>
            </a>
          )}
          {order.files.length > 0 && (
            <ul className="mt-3 grid gap-4 sm:grid-cols-2">
              {order.files.map((file) => (
                <UploadedVideoPlayer
                  key={file.id}
                  file={file}
                  removing={removingFileId === file.id}
                  onRemove={() => handleRemoveClip(file)}
                />
              ))}
            </ul>
          )}
        </div>
        {order.editedVideos.length > 0 && (
          <div>
            <p className="mb-3 text-gray-500 text-xs uppercase tracking-wide">
              Edited video for review
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              {order.editedVideos.map((video) => (
                <EditedVideoReview key={video.id} video={video} onReviewed={onChanged} />
              ))}
            </div>
          </div>
        )}
        {(order.referenceUrl || order.styleNotes) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {order.referenceUrl && (
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                  Reference
                </p>
                <a
                  href={order.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:text-brand-300 text-xs truncate block"
                >
                  {order.referenceUrl}
                </a>
              </div>
            )}
            {order.styleNotes && (
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                  Style notes
                </p>
                <p className="text-gray-400 text-xs line-clamp-3">{order.styleNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
