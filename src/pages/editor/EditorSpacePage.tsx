import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileVideo,
  FolderOpen,
  LayoutDashboard,
  Loader2,
  LogOut,
  RefreshCw,
  Scissors,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "../../components/dashboard/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { siteConfig } from "../../data/content";
import { useAdminOrders, useAdminProfiles } from "../../hooks/useAdminData";
import { useEditorWorkspace } from "../../hooks/useEditorData";
import { updateAdminOrderStatus } from "../../lib/admin";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_ORDER,
  type OrderStatus,
} from "../../lib/orders";
import type { EditorOrder } from "../../lib/editor";

type Filter = "all" | "active" | OrderStatus;

const filters: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
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

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function EditorSpacePage() {
  const { editor, role, user, signOut } = useAuth();
  const navigate = useNavigate();
  const editorWorkspace = useEditorWorkspace(
    editor?.accessToken,
  );
  const adminOrdersData = useAdminOrders();
  const adminProfilesData = useAdminProfiles();
  const [filter, setFilter] = useState<Filter>("active");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const isAdminView = role === "admin";

  const adminClients = useMemo(() => {
    const clientProfiles = adminProfilesData.profiles.filter(
      (profile) => profile.role === "user",
    );

    return clientProfiles.map((profile) => {
      const profileOrders = adminOrdersData.orders.filter(
        (order) => order.userId === profile.id,
      );

      return {
        id: profile.id,
        email: profile.email,
        assignedAt: profile.createdAt,
        orderCount: profileOrders.length,
        activeOrderCount: profileOrders.filter((order) => order.status !== "done").length,
      };
    });
  }, [adminOrdersData.orders, adminProfilesData.profiles]);

  const adminOrders = useMemo<EditorOrder[]>(
    () =>
      adminOrdersData.orders.map((order) => ({
        ...order,
        customerEmail: order.customerEmail ?? order.userId,
      })),
    [adminOrdersData.orders],
  );

  const clients = isAdminView ? adminClients : editorWorkspace.clients;
  const orders = isAdminView ? adminOrders : editorWorkspace.orders;
  const loading = isAdminView
    ? adminOrdersData.loading || adminProfilesData.loading
    : editorWorkspace.loading;
  const error = isAdminView
    ? adminOrdersData.error ?? adminProfilesData.error
    : editorWorkspace.error;
  const refresh = isAdminView
    ? async () => {
        await Promise.all([adminOrdersData.refresh(), adminProfilesData.refresh()]);
      }
    : editorWorkspace.refresh;

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "active") return orders.filter((order) => order.status !== "done");
    return orders.filter((order) => order.status === filter);
  }, [filter, orders]);

  const activeOrders = orders.filter((order) => order.status !== "done").length;
  const reviewOrders = orders.filter((order) => order.status === "review").length;
  const deliveredOrders = orders.filter((order) => order.status === "done").length;

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setActionError(null);
    setUpdatingId(orderId);
    const result = isAdminView
      ? await updateAdminOrderStatus(orderId, status)
      : await editorWorkspace.updateStatus(orderId, status);
    setUpdatingId(null);

    if (result.error) {
      setActionError(result.error);
    }
  }

  return (
    <div className="flex min-h-screen bg-surface-950 text-gray-300">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-surface-900/50 p-5 lg:flex">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-600/20">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="block font-display text-lg font-bold tracking-tight text-white">
              {siteConfig.name}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500">
              Editor Space
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <a
            href="#overview"
            className="flex items-center gap-3 rounded-xl border border-brand-500/30 bg-brand-600/20 px-3 py-2.5 text-sm font-medium text-white"
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </a>
          <a
            href="#orders"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <FolderOpen className="h-4 w-4" />
            Orders
          </a>
          <a
            href="#clients"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Users className="h-4 w-4" />
            Clients
          </a>
        </nav>

        <div className="mt-auto border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-surface-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Signed in as</p>
              <p className="max-w-[220px] truncate text-sm font-semibold text-white sm:max-w-md">
                {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                aria-label="Refresh"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <section id="overview" className="mb-8">
              <div className="mb-6">
                <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  Editor Space
                </h1>
                <p className="mt-2 text-gray-400">
                  {isAdminView
                    ? "Admin view across all clients, uploads, and delivery statuses."
                    : "Track assigned clients, review uploads, and move edits through delivery."}
                </p>
              </div>

              {(error || actionError) && (
                <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error ?? actionError}
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat icon={<Users className="h-5 w-5 text-brand-300" />} label="Clients" value={String(clients.length)} />
                <Stat icon={<FolderOpen className="h-5 w-5 text-cyan-300" />} label="Active orders" value={String(activeOrders)} />
                <Stat icon={<CalendarDays className="h-5 w-5 text-amber-300" />} label="In review" value={String(reviewOrders)} />
                <Stat icon={<CheckCircle2 className="h-5 w-5 text-emerald-300" />} label="Delivered" value={String(deliveredOrders)} />
              </div>
            </section>

            <section id="orders" className="mb-8">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {isAdminView ? "All orders" : "Assigned orders"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {isAdminView
                      ? "Admin access shows every client order in the editor workflow."
                      : "Only orders from clients assigned to you are visible here."}
                  </p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
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
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="glass rounded-3xl p-12 text-center text-gray-400">
                  <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-brand-400" />
                  Loading editor workspace...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="glass rounded-3xl p-12 text-center">
                  <FolderOpen className="mx-auto mb-4 h-12 w-12 text-brand-400 opacity-60" />
                  <h3 className="font-display text-xl font-bold text-white">No orders found</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                    {isAdminView
                      ? "Orders will appear here after clients upload footage."
                      : "New work appears here after an admin assigns clients to you."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <EditorOrderCard
                      key={order.id}
                      order={order}
                      updating={updatingId === order.id}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </section>

            <section id="clients">
              <div className="mb-4">
                <h2 className="font-display text-xl font-bold text-white">
                  {isAdminView ? "All clients" : "Assigned clients"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {isAdminView
                    ? "Every client account and order volume."
                    : "Client list and order volume for your queue."}
                </p>
              </div>
              <div className="glass overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-5 py-4 font-medium">Client</th>
                        <th className="px-5 py-4 font-medium">Active orders</th>
                        <th className="px-5 py-4 font-medium">Total orders</th>
                        <th className="px-5 py-4 font-medium">Assigned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.length === 0 ? (
                        <tr className="border-t border-white/10">
                          <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                            {isAdminView ? "No clients found yet." : "No clients assigned yet."}
                          </td>
                        </tr>
                      ) : (
                        clients.map((client) => (
                          <tr key={client.id} className="border-t border-white/10">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-white">{client.email}</p>
                              <p className="font-mono text-xs text-gray-600">{client.id}</p>
                            </td>
                            <td className="px-5 py-4 text-gray-300">{client.activeOrderCount}</td>
                            <td className="px-5 py-4 text-gray-300">{client.orderCount}</td>
                            <td className="px-5 py-4 text-gray-400">
                              {formatDate(client.assignedAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

function EditorOrderCard({
  order,
  updating,
  onStatusChange,
}: {
  order: EditorOrder;
  updating: boolean;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}) {
  return (
    <article className="glass rounded-2xl p-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-lg font-bold text-white">{order.title}</h3>
            <StatusBadge status={order.status} />
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Client" value={order.customerEmail} />
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

        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <label className="sr-only" htmlFor={`editor-status-${order.id}`}>
            Update status
          </label>
          <select
            id={`editor-status-${order.id}`}
            value={order.status}
            disabled={updating}
            onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatus)}
            className="h-11 rounded-xl border border-white/10 bg-surface-800 px-3 text-sm font-semibold text-white outline-none transition-colors focus:border-brand-400 disabled:opacity-50"
          >
            {ORDER_STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          {updating && (
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
              <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">Files</p>
              <div className="space-y-2">
                {order.files.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 text-gray-300">
                    <FileVideo className="h-4 w-4 shrink-0 text-brand-300" />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <span className="text-xs text-gray-600">{formatSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.footageUrl && <LinkBlock label="Drive footage" href={order.footageUrl} />}
          {order.referenceUrl && <LinkBlock label="Reference" href={order.referenceUrl} />}
          {order.styleNotes && (
            <div className="rounded-2xl border border-white/10 bg-surface-800/60 p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Style notes</p>
              <p className="line-clamp-5 whitespace-pre-wrap text-gray-300">{order.styleNotes}</p>
            </div>
          )}
        </div>
      )}
    </article>
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
      rel="noreferrer"
      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface-800/60 p-4 text-gray-300 transition-colors hover:border-brand-400/40 hover:text-white"
    >
      <span className="min-w-0">
        <span className="block text-xs uppercase tracking-wide text-gray-500">{label}</span>
        <span className="mt-1 block truncate text-sm">{href}</span>
      </span>
      <ExternalLink className="h-4 w-4 shrink-0" />
    </a>
  );
}
