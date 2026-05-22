import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileVideo,
  Link2,
  MessageSquare,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createOrder } from "../../lib/orders";
import { dashboardCopy } from "../../data/dashboard";
import { PipelineProgress } from "./PipelineProgress";

function VideoPreview({
  file,
  disabled,
  onRemove,
  formatSize,
}: {
  file: File;
  disabled: boolean;
  onRemove: () => void;
  formatSize: (bytes: number) => string;
}) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <li className="overflow-hidden rounded-2xl bg-surface-700/50 border border-white/10">
      {previewUrl && (
        <video
          src={previewUrl}
          controls
          preload="metadata"
          className="aspect-video w-full bg-black object-contain"
        >
          Your browser does not support video preview.
        </video>
      )}
      <div className="flex items-center gap-3 px-4 py-3">
        <FileVideo className="h-5 w-5 text-brand-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">{file.name}</p>
          <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40"
          aria-label={`Remove ${file.name}`}
          title="Remove video"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

export function UploadForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [footageUrl, setFootageUrl] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [styleNotes, setStyleNotes] = useState("");
  const [title, setTitle] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (uploading || footageUrl.trim()) return;

    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("video/"),
    );
    setFiles((prev) => [...prev, ...dropped]);
  }, [footageUrl, uploading]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (footageUrl.trim()) {
      e.target.value = "";
      return;
    }

    if (e.target.files) {
      const selected = Array.from(e.target.files).filter((f) =>
        f.type.startsWith("video/"),
      );
      setFiles((prev) => [...prev, ...selected]);
      e.target.value = "";
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  function isGoogleDriveUrl(url: string) {
    if (!url.trim()) return true;

    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      return host === "drive.google.com" || host === "docs.google.com";
    } catch {
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanFootageUrl = footageUrl.trim();
    if (!user || uploading) return;

    if (files.length === 0 && !cleanFootageUrl) {
      setError("Upload video files or add a Google Drive folder link.");
      return;
    }

    if (files.length > 0 && cleanFootageUrl) {
      setError("Choose one footage option: upload videos or add a Drive folder link.");
      return;
    }

    if (!isGoogleDriveUrl(cleanFootageUrl)) {
      setError("Please add a valid Google Drive folder link.");
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });

    const { error: createError } = await createOrder(
      user.id,
      {
        title,
        footageUrl: cleanFootageUrl || undefined,
        referenceUrl: referenceUrl || undefined,
        styleNotes: styleNotes || undefined,
      },
      files,
      (done, total) => setUploadProgress({ done, total }),
    );

    setUploading(false);

    if (createError) {
      setError(createError);
      return;
    }

    setSubmitted(true);
  }

  function resetForm() {
    setSubmitted(false);
    setFiles([]);
    setFootageUrl("");
    setTitle("");
    setReferenceUrl("");
    setStyleNotes("");
    setError(null);
    setUploadProgress({ done: 0, total: 0 });
  }

  const hasFiles = files.length > 0;
  const hasDriveLink = footageUrl.trim().length > 0;
  const uploadDisabled = uploading || hasDriveLink;
  const driveDisabled = uploading || hasFiles;
  const canSubmit = (hasFiles || hasDriveLink) && !uploading;

  if (submitted) {
    return (
      <div className="glass rounded-3xl p-8 sm:p-12 text-center max-w-2xl">
        <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-6" />
        <h2 className="font-display text-2xl font-bold text-white">
          Order submitted
        </h2>
        <p className="mt-3 text-gray-400 max-w-md mx-auto">
          Your footage details are saved. Track progress from your dashboard.
        </p>
        <div className="mt-8 flex justify-center">
          <PipelineProgress status="received" />
        </div>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate("/dashboard/orders")}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors"
          >
            View orders
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 rounded-xl glass text-white font-medium hover:bg-white/5 transition-colors"
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            {dashboardCopy.uploadTitle}
          </h1>
          <p className="mt-2 text-gray-400 text-sm sm:text-base">
            {dashboardCopy.uploadSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 glass rounded-full px-4 py-2 text-sm w-fit">
          <Clock className="h-4 w-4 text-brand-400" />
          <span className="text-gray-300">{dashboardCopy.turnaround}</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6">
          <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
            Project title
          </label>
          <input
            id="title"
            type="text"
            required
            disabled={uploading}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Week 12 Reel — Fitness Tips"
            className="w-full rounded-xl bg-surface-700/50 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50"
          />
        </div>

        <div
          className={`glass rounded-2xl p-8 border-2 border-dashed transition-colors ${
            uploadDisabled
              ? "border-white/10 opacity-50"
              : dragOver
                ? "border-brand-500 bg-brand-600/10"
                : "border-white/10"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            if (uploadDisabled) return;
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="h-12 w-12 text-brand-400 mx-auto mb-4" />
            <p className="text-white font-medium">Drag & drop video files here</p>
            <p className="text-sm text-gray-500 mt-1">MP4, MOV, AVI up to 2GB per file</p>
            <label
              className={`mt-4 inline-block ${
                uploadDisabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  uploadDisabled
                    ? "text-gray-500"
                    : "text-brand-400 hover:text-brand-300"
                }`}
              >
                {hasDriveLink ? "Drive link selected" : "Browse files"}
              </span>
              <input
                type="file"
                accept="video/*"
                multiple
                disabled={uploadDisabled}
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {files.length > 0 && (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {files.map((file, i) => (
                <VideoPreview
                  key={`${file.name}-${file.size}-${file.lastModified}-${i}`}
                  file={file}
                  disabled={uploading}
                  onRemove={() => removeFile(i)}
                  formatSize={formatSize}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="rounded-full border border-white/10 bg-surface-800 px-4 py-1 text-xs font-bold uppercase tracking-wide text-gray-400">
            OR
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="glass rounded-2xl p-6">
          <label
            htmlFor="footage"
            className="flex items-center gap-2 text-sm font-medium text-white mb-2"
          >
            <Link2 className="h-4 w-4 text-brand-400" />
            Google Drive folder link
          </label>
          <input
            id="footage"
            type="url"
            disabled={driveDisabled}
            value={footageUrl}
            onChange={(e) => setFootageUrl(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            className="w-full rounded-xl bg-surface-700/50 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50"
          />
          <p className="mt-2 text-xs text-gray-500">
            {hasFiles
              ? "Remove selected videos to use a Drive folder link."
              : "Paste a Drive folder link if you are not uploading files here."}
          </p>
        </div>

        <div className="glass rounded-2xl p-6">
          <label
            htmlFor="reference"
            className="flex items-center gap-2 text-sm font-medium text-white mb-2"
          >
            <Link2 className="h-4 w-4 text-brand-400" />
            Reference video URL (optional)
          </label>
          <input
            id="reference"
            type="url"
            disabled={uploading}
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder="https://instagram.com/reel/..."
            className="w-full rounded-xl bg-surface-700/50 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50"
          />
        </div>

        <div className="glass rounded-2xl p-6">
          <label
            htmlFor="notes"
            className="flex items-center gap-2 text-sm font-medium text-white mb-2"
          >
            <MessageSquare className="h-4 w-4 text-brand-400" />
            Style notes & instructions
          </label>
          <textarea
            id="notes"
            rows={4}
            disabled={uploading}
            value={styleNotes}
            onChange={(e) => setStyleNotes(e.target.value)}
            placeholder="Describe your preferred style: fast cuts, cinematic, trending audio, brand colors, pace, etc."
            className="w-full rounded-xl bg-surface-700/50 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none disabled:opacity-50"
          />
        </div>

        {uploading && uploadProgress.total > 0 && (
          <p className="text-center text-sm text-brand-300">
            Uploading {uploadProgress.done} of {uploadProgress.total} file
            {uploadProgress.total !== 1 ? "s" : ""} to Supabase…
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Uploading…
            </>
          ) : (
            "Submit for editing"
          )}
        </button>
      </form>
    </div>
  );
}
