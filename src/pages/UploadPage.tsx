import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  FileVideo,
  Link2,
  MessageSquare,
  X,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Info,
} from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

type OrderStatus = "draft" | "submitted";

const pipelineStages = [
  { id: "received", label: "Received", active: false },
  { id: "editing", label: "Editing", active: false },
  { id: "review", label: "Review", active: false },
  { id: "done", label: "Done", active: false },
];

export function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [referenceUrl, setReferenceUrl] = useState("");
  const [styleNotes, setStyleNotes] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<OrderStatus>("draft");
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("video/")
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
    setStatus("submitted");
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 min-h-screen">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
                Upload Portal
              </h1>
              <p className="mt-2 text-gray-400">
                Upload raw footage, add references & style notes. Your editor
                takes it from here.
              </p>
            </div>
            <div className="flex items-center gap-2 glass rounded-full px-4 py-2 text-sm">
              <Clock className="h-4 w-4 text-brand-400" />
              <span className="text-gray-300">48hr turnaround</span>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 mb-8 flex gap-3">
            <Info className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-400">
              <span className="text-white font-medium">Phase 1 Preview:</span>{" "}
              Yeh upload portal ka frontend UI hai. File storage aur backend
              integration next phase mein connect hoga. Abhi aap flow dekh
              sakte ho aur waitlist join kar sakte ho.
            </p>
          </div>

          {status === "submitted" ? (
            <div className="glass rounded-3xl p-8 sm:p-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-6" />
              <h2 className="font-display text-2xl font-bold text-white">
                Order Submitted! (Demo)
              </h2>
              <p className="mt-3 text-gray-400 max-w-md mx-auto">
                Backend connect hone ke baad aapka order track hoga. Abhi ke
                liye humne aapka submission receive kar liya hai locally.
              </p>

              <div className="mt-10 flex justify-center gap-2 sm:gap-4">
                {pipelineStages.map((stage, i) => (
                  <div key={stage.id} className="flex items-center gap-2 sm:gap-4">
                    <div
                      className={`flex flex-col items-center ${
                        i === 0 ? "opacity-100" : "opacity-40"
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          i === 0
                            ? "bg-brand-600 text-white"
                            : "bg-surface-600 text-gray-400"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className="text-xs text-gray-400 mt-2 hidden sm:block">
                        {stage.label}
                      </span>
                    </div>
                    {i < pipelineStages.length - 1 && (
                      <div className="w-8 sm:w-12 h-px bg-surface-500" />
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStatus("draft");
                  setFiles([]);
                  setTitle("");
                  setReferenceUrl("");
                  setStyleNotes("");
                }}
                className="mt-10 text-brand-400 hover:text-brand-300 font-medium"
              >
                Submit another order
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                  Project Title
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
                  dragOver
                    ? "border-brand-500 bg-brand-600/10"
                    : "border-white/10"
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
                  <p className="text-white font-medium">
                    Drag & drop video files here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    MP4, MOV, AVI up to 2GB per file
                  </p>
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
                          <p className="text-sm text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatSize(file.size)}
                          </p>
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
                  Reference Video URL (optional)
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
                  Style Notes & Instructions
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={styleNotes}
                  onChange={(e) => setStyleNotes(e.target.value)}
                  placeholder="Describe your preferred style: fast cuts, cinematic, trending audio, brand colors (#FF5733), pace, etc."
                  className="w-full rounded-xl bg-surface-700/50 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={files.length === 0}
                className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-brand-600/25"
              >
                Submit for Editing
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
