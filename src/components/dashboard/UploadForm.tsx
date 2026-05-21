import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileVideo,
  Link2,
  MessageSquare,
  X,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createOrder } from "../../lib/orders";
import { dashboardCopy } from "../../data/dashboard";
import { PipelineProgress } from "./PipelineProgress";

export function UploadForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [referenceUrl, setReferenceUrl] = useState("");
  const [styleNotes, setStyleNotes] = useState("");
  const [title, setTitle] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("video/"),
    );
    setFiles((prev) => [...prev, ...dropped]);
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || files.length === 0) return;

    createOrder(user.id, {
      title,
      files: files.map((f) => ({ name: f.name, size: f.size })),
      referenceUrl: referenceUrl || undefined,
      styleNotes: styleNotes || undefined,
    });
    setSubmitted(true);
  }

  function resetForm() {
    setSubmitted(false);
    setFiles([]);
    setTitle("");
    setReferenceUrl("");
    setStyleNotes("");
  }

  if (submitted) {
    return (
      <div className="glass rounded-3xl p-8 sm:p-12 text-center max-w-2xl">
        <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-6" />
        <h2 className="font-display text-2xl font-bold text-white">
          Order submitted
        </h2>
        <p className="mt-3 text-gray-400 max-w-md mx-auto">
          Your editor has been notified. Track progress from your dashboard.
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6">
          <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
            Project title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Week 12 Reel — Fitness Tips"
            className="w-full rounded-xl bg-surface-700/50 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        <div
          className={`glass rounded-2xl p-8 border-2 border-dashed transition-colors ${
            dragOver ? "border-brand-500 bg-brand-600/10" : "border-white/10"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="h-12 w-12 text-brand-400 mx-auto mb-4" />
            <p className="text-white font-medium">Drag & drop video files here</p>
            <p className="text-sm text-gray-500 mt-1">MP4, MOV, AVI up to 2GB per file</p>
            <label className="mt-4 inline-block cursor-pointer">
              <span className="text-sm font-semibold text-brand-400 hover:text-brand-300">
                Browse files
              </span>
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {files.length > 0 && (
            <ul className="mt-6 space-y-2">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-3 bg-surface-700/50 rounded-xl px-4 py-3"
                >
                  <FileVideo className="h-5 w-5 text-brand-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
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
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder="https://instagram.com/reel/..."
            className="w-full rounded-xl bg-surface-700/50 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
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
            value={styleNotes}
            onChange={(e) => setStyleNotes(e.target.value)}
            placeholder="Describe your preferred style: fast cuts, cinematic, trending audio, brand colors, pace, etc."
            className="w-full rounded-xl bg-surface-700/50 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={files.length === 0}
          className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-brand-600/25"
        >
          Submit for editing
        </button>
      </form>
    </div>
  );
}
