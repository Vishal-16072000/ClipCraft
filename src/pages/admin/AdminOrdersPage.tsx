import { useMemo, useState } from "react";
import {
  ExternalLink,
  FileVideo,
  Filter,
  FolderOpen,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { adminCopy } from "../../data/admin";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_ORDER,
  type OrderStatus,
} from "../../lib/orders";
import { updateAdminOrderStatus } from "../../lib/admin";
import { useAdminOrders } from "../../hooks/useAdminData";
import { StatusBadge } from "../../components/dashboard/StatusBadge";

const filters: Array<{ id: "all" | OrderStatus; label: string }> = [
  { id: "all", label: "All" },
  ...ORDER_STATUS_ORDER.map((status) => ({
    id: status,
    label: ORDER_STATUS_LABELS[status],
  })),
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminOrdersPage() {
  const { orders, loading, error, refresh } = useAdminOrders();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((order) => order.status === filter)),
    [filter, orders],
  );

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setActionError(null);
    setUpdatingId(orderId);
    const { error: updateError } = await updateAdminOrderStatus(orderId, status);
    setUpdatingId(null);

    if (updateError) {
      setActionError(updateError);
      return;
    }

    await refresh();
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {adminCopy.ordersTitle}
            </h1>
            <p className="mt-2 text-gray-400">{adminCopy.ordersSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {(error || actionError) && (
          <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error ?? actionError}
          </p>
        )}

        {orders.length > 0 && (
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 shrink-0 text-gray-500" />
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  filter === item.id
                    ? "bg-brand-600 text-white"
                    : "glass text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
                {item.id !== "all" && (
                  <span className="ml-1.5 opacity-70">
                    ({orders.filter((order) => order.status === item.id).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="glass rounded-3xl p-12 text-center text-gray-400">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-brand-400" />
            Loading orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <FolderOpen className="mx-auto mb-4 h-12 w-12 text-brand-400 opacity-60" />
            <h2 className="font-display text-xl font-bold text-white">
              No orders found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Orders will show here after clients upload footage.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <article key={order.id} className="glass rounded-2xl p-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-lg font-bold text-white">
                        {order.title}
                      </h2>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <Info label="Client" value={order.customerEmail ?? order.userId} />
                      <Info label="Submitted" value={formatDate(order.createdAt)} />
                      <Info
                        label="Footage"
                        value={
                          order.files.length > 0
                            ? `${order.files.length} file${order.files.length === 1 ? "" : "s"}`
                            : order.footageUrl
                              ? "Drive folder"
                              : "No footage"
                        }
                      />
                      <Info label="Updated" value={formatDate(order.updatedAt)} />
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:flex-col">
                    <label className="sr-only" htmlFor={`status-${order.id}`}>
                      Update status
                    </label>
                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(event) =>
                        handleStatusChange(order.id, event.target.value as OrderStatus)
                      }
                      className="h-11 rounded-xl border border-white/10 bg-surface-800 px-3 text-sm font-semibold text-white outline-none transition-colors focus:border-brand-400 disabled:opacity-50"
                    >
                      {ORDER_STATUS_ORDER.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    {updatingId === order.id && (
                      <span className="inline-flex items-center gap-2 text-xs text-brand-300">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Updating
                      </span>
                    )}
                  </div>
                </div>

                {(order.footageUrl || order.referenceUrl || order.styleNotes || order.files.length > 0) && (
                  <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 text-sm lg:grid-cols-3">
                    {order.files.length > 0 && (
                      <div className="rounded-2xl border border-white/10 bg-surface-800/60 p-4">
                        <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">
                          Files
                        </p>
                        <div className="space-y-2">
                          {order.files.slice(0, 4).map((file) => (
                            <div key={file.id} className="flex items-center gap-2 text-gray-300">
                              <FileVideo className="h-4 w-4 shrink-0 text-brand-300" />
                              <span className="truncate">{file.name}</span>
                            </div>
                          ))}
                          {order.files.length > 4 && (
                            <p className="text-xs text-gray-500">
                              +{order.files.length - 4} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {order.footageUrl && (
                      <LinkBlock label="Drive footage" href={order.footageUrl} />
                    )}
                    {order.referenceUrl && (
                      <LinkBlock label="Reference" href={order.referenceUrl} />
                    )}
                    {order.styleNotes && (
                      <div className="rounded-2xl border border-white/10 bg-surface-800/60 p-4">
                        <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                          Style notes
                        </p>
                        <p className="line-clamp-4 text-gray-300">{order.styleNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 truncate text-gray-300">{value}</p>
    </div>
  );
}

function LinkBlock({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-800/60 p-4 text-brand-300 transition-colors hover:border-brand-500/40 hover:bg-brand-600/10 hover:text-white"
    >
      <ExternalLink className="h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <p className="mt-1 truncate text-sm">{href}</p>
      </div>
    </a>
  );
}
