import { Link } from "react-router-dom";
import { FileVideo, ChevronRight, Clock } from "lucide-react";
import type { Order } from "../../lib/orders";
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

export function OrderCard({
  order,
  compact = false,
}: {
  order: Order;
  compact?: boolean;
}) {
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
            {order.files.length} file{order.files.length !== 1 ? "s" : ""} ·{" "}
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

      <div className="mt-5 pt-5 border-t border-white/10 grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Files</p>
          <p className="text-white">
            {order.files.length} video{order.files.length !== 1 ? "s" : ""} ·{" "}
            {formatSize(totalSize(order))}
          </p>
          <ul className="mt-2 space-y-1">
            {order.files.slice(0, 3).map((f) => (
              <li key={f.name} className="text-xs text-gray-400 truncate">
                {f.name}
              </li>
            ))}
            {order.files.length > 3 && (
              <li className="text-xs text-gray-500">
                +{order.files.length - 3} more
              </li>
            )}
          </ul>
        </div>
        {(order.referenceUrl || order.styleNotes) && (
          <div>
            {order.referenceUrl && (
              <div className="mb-3">
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
