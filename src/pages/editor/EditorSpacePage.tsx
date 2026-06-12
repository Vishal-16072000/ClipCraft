import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  FileVideo,
  FolderOpen,
  Link2,
  LayoutDashboard,
  Loader2,
  LogOut,
  PlayCircle,
  RefreshCw,
  Scissors,
  Trash2,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EditedVideoCommentThread } from "../../components/dashboard/EditedVideoCommentThread";
import { StatusBadge } from "../../components/dashboard/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { siteConfig } from "../../data/content";
import { useAdminOrders, useAdminProfiles } from "../../hooks/useAdminData";
import { useEditorWorkspace } from "../../hooks/useEditorData";
import { updateAdminOrderStatus } from "../../lib/admin";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_ORDER,
  getSignedFileUrl,
  type EditedVideo,
  type OrderFile,
  type OrderStatus,
} from "../../lib/orders";
import {
  deleteEditorEditedVideo,
  deleteEditorOrderFile,
  type EditorOrder,
} from "../../lib/editor";
import { deleteAdminEditedVideo, deleteAdminOrderFile } from "../../lib/admin";

type Filter = "all" | "active" | OrderStatus;
type EditorSection = "overview" | "clients" | "orders";

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

function getReviewStatusLabel(status: EditedVideo["reviewStatus"]) {
  if (status === "satisfied") return "Satisfied";
  if (status === "changes_requested") return "Changes requested";
  return "Pending review";
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
  const [activeSection, setActiveSection] = useState<EditorSection>("overview");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
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
    const scopedOrders = selectedClientId
      ? orders.filter((order) => order.userId === selectedClientId)
      : orders;

    if (filter === "all") return scopedOrders;
    if (filter === "active") return scopedOrders.filter((order) => order.status !== "done");
    return scopedOrders.filter((order) => order.status === filter);
  }, [filter, orders, selectedClientId]);

  const clientSummaries = useMemo(
    () =>
      clients.map((client) => {
        const clientOrders = orders.filter((order) => order.userId === client.id);
        const latestOrder = clientOrders[0];
        const rawClipCount = clientOrders.reduce(
          (total, order) => total + order.files.length + (order.footageUrl ? 1 : 0),
          0,
        );
        const editedVideoCount = clientOrders.reduce(
          (total, order) => total + order.editedVideos.length,
          0,
        );
        const reviewCount = clientOrders.filter((order) => order.status === "review").length;
        const changeRequests = clientOrders.reduce(
          (total, order) =>
            total +
            order.editedVideos.filter((video) => video.reviewStatus === "changes_requested").length,
          0,
        );

        return {
          ...client,
          latestOrder,
          rawClipCount,
          editedVideoCount,
          reviewCount,
          changeRequests,
        };
      }),
    [clients, orders],
  );

  const selectedClient =
    clientSummaries.find((client) => client.id === selectedClientId) ?? clientSummaries[0] ?? null;
  const selectedClientOrders = selectedClient
    ? orders.filter((order) => order.userId === selectedClient.id)
    : [];

  useEffect(() => {
    if (selectedClientId && clients.some((client) => client.id === selectedClientId)) return;
    setSelectedClientId(clients[0]?.id ?? null);
  }, [clients, selectedClientId]);

  const activeOrders = orders.filter((order) => order.status !== "done").length;
  const reviewOrders = orders.filter((order) => order.status === "review").length;
  const deliveredOrders = orders.filter((order) => order.status === "done").length;
  const showClientsLoading = loading && clients.length === 0;
  const showWorkspaceLoading = loading && orders.length === 0;

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

  function getNavItemClass(section: EditorSection) {
    const base =
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";

    if (activeSection === section) {
      return `${base} border border-brand-500/30 bg-brand-600/20 text-white`;
    }

    return `${base} text-gray-400 hover:bg-white/5 hover:text-white`;
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
            onClick={() => setActiveSection("overview")}
            className={getNavItemClass("overview")}
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </a>
          <a
            href="#clients"
            onClick={() => setActiveSection("clients")}
            className={getNavItemClass("clients")}
          >
            <Users className="h-4 w-4" />
            Clients
          </a>
          <a
            href="#orders"
            onClick={() => setActiveSection("orders")}
            className={getNavItemClass("orders")}
          >
            <FolderOpen className="h-4 w-4" />
            Workspace
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

            <section id="clients" className="mb-8">
              <div className="mb-4">
                <h2 className="font-display text-xl font-bold text-white">
                  {isAdminView ? "Client table" : "Assigned clients"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Click a row to open that client's footage, edits, and feedback workspace.
                </p>
              </div>

              {showClientsLoading ? (
                <div className="glass rounded-3xl p-12 text-center text-gray-400">
                  <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-brand-400" />
                  Loading clients...
                </div>
              ) : clientSummaries.length === 0 ? (
                <div className="glass rounded-3xl p-12 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-brand-400 opacity-60" />
                  <h3 className="font-display text-xl font-bold text-white">No clients assigned</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                    Clients will appear here after an admin assigns them to this editor.
                  </p>
                </div>
              ) : (
                <div className="glass overflow-hidden rounded-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1040px] text-left text-sm">
                      <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-5 py-4 font-medium">Client</th>
                          <th className="px-5 py-4 font-medium">Status</th>
                          <th className="px-5 py-4 font-medium">Orders</th>
                          <th className="px-5 py-4 font-medium">Raw footage</th>
                          <th className="px-5 py-4 font-medium">In review</th>
                          <th className="px-5 py-4 font-medium">Edited videos</th>
                          <th className="px-5 py-4 font-medium">Latest upload</th>
                          <th className="px-5 py-4 font-medium">Feedback</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientSummaries.map((client) => (
                          <tr
                            key={client.id}
                            onClick={() => {
                              setSelectedClientId(client.id);
                              setFilter("active");
                            }}
                            className={`cursor-pointer border-t border-white/10 transition-colors ${
                              selectedClient?.id === client.id
                                ? "bg-brand-500/10"
                                : "hover:bg-white/[0.04]"
                            }`}
                          >
                            <td className="px-5 py-4">
                              <p className="font-semibold text-white">{client.email}</p>
                              <p className="mt-1 font-mono text-xs text-gray-600">{client.id}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  client.activeOrderCount > 0
                                    ? "bg-emerald-500/10 text-emerald-300"
                                    : "bg-white/5 text-gray-500"
                                }`}
                              >
                                {client.activeOrderCount > 0 ? "Active" : "Idle"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-gray-300">{client.orderCount}</td>
                            <td className="px-5 py-4 text-gray-300">{client.rawClipCount}</td>
                            <td className="px-5 py-4 text-gray-300">{client.reviewCount}</td>
                            <td className="px-5 py-4 text-gray-300">{client.editedVideoCount}</td>
                            <td className="px-5 py-4 text-gray-400">
                              {client.latestOrder ? (
                                <>
                                  <p className="max-w-[180px] truncate text-gray-200">
                                    {client.latestOrder.title}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-600">
                                    {formatDate(client.latestOrder.createdAt)}
                                  </p>
                                </>
                              ) : (
                                "No upload yet"
                              )}
                            </td>
                            <td className="px-5 py-4">
                              {client.changeRequests > 0 ? (
                                <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                                  {client.changeRequests} change request{client.changeRequests === 1 ? "" : "s"}
                                </span>
                              ) : (
                                <span className="text-gray-600">None</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            <section id="orders" className="mb-8">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {selectedClient ? selectedClient.email : "Client workspace"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedClient
                      ? `${selectedClientOrders.length} order${selectedClientOrders.length === 1 ? "" : "s"} for this client. Review raw footage, upload edited videos, and track feedback here.`
                      : "Select a client above to see their footage and edits."}
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

              {!selectedClient ? (
                <div className="glass rounded-3xl p-12 text-center text-gray-500">
                  Select a client to open their workspace.
                </div>
              ) : showWorkspaceLoading ? (
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
                      ? "This client has no orders in the selected filter."
                      : "This client has no orders in the selected filter."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <EditorOrderCard
                      key={order.id}
                      order={order}
                      updating={updatingId === order.id}
                      isAdminView={isAdminView}
                      editorToken={editor?.accessToken}
                      viewerUserId={user?.id}
                      viewerEditorId={editor?.id}
                      onCommentsChanged={refresh}
                      onDeleteClip={async (orderId, file) => {
                        if (isAdminView) {
                          return deleteAdminOrderFile(orderId, file);
                        }
                        if (!editor?.accessToken) {
                          return { error: "Editor session expired. Please sign in again." };
                        }
                        return deleteEditorOrderFile(editor.accessToken, orderId, file);
                      }}
                      onDeleteEditedVideo={async (video) => {
                        if (isAdminView) {
                          return deleteAdminEditedVideo(video);
                        }
                        if (!editor?.accessToken) {
                          return { error: "Editor session expired. Please sign in again." };
                        }
                        return deleteEditorEditedVideo(editor.accessToken, video);
                      }}
                      onStatusChange={handleStatusChange}
                      onUploadEdit={
                        isAdminView
                          ? async () => ({ error: "Sign in as an editor to upload edited videos." })
                          : editorWorkspace.uploadEdit
                      }
                      onSubmitEditDriveLink={
                        isAdminView
                          ? async () => ({ error: "Sign in as an editor to submit edited videos." })
                          : editorWorkspace.submitEditDriveLink
                      }
                    />
                  ))}
                </div>
              )}
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

function isGoogleDriveUrl(url: string) {
  if (!url.trim()) return true;

  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "drive.google.com" || host === "docs.google.com";
  } catch {
    return false;
  }
}

function editedDriveLinkDraftKey(orderId: string) {
  return `clipcraft:edited-drive-link:${orderId}`;
}

function readEditedDriveLinkDraft(orderId: string) {
  try {
    return sessionStorage.getItem(editedDriveLinkDraftKey(orderId)) ?? "";
  } catch {
    return "";
  }
}

function writeEditedDriveLinkDraft(orderId: string, value: string) {
  try {
    const key = editedDriveLinkDraftKey(orderId);
    if (value.trim()) {
      sessionStorage.setItem(key, value);
    } else {
      sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore storage errors.
  }
}

function EditorOrderCard({
  order,
  updating,
  isAdminView,
  editorToken,
  viewerUserId,
  viewerEditorId,
  onCommentsChanged,
  onDeleteClip,
  onDeleteEditedVideo,
  onStatusChange,
  onUploadEdit,
  onSubmitEditDriveLink,
}: {
  order: EditorOrder;
  updating: boolean;
  isAdminView: boolean;
  editorToken?: string;
  viewerUserId?: string;
  viewerEditorId?: string;
  onCommentsChanged?: () => void | Promise<void>;
  onDeleteClip?: (
    orderId: string,
    file: OrderFile,
  ) => Promise<{ error: string | null }>;
  onDeleteEditedVideo?: (video: EditedVideo) => Promise<{ error: string | null }>;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onUploadEdit: (orderId: string, file: File) => Promise<{ error: string | null }>;
  onSubmitEditDriveLink: (orderId: string, driveUrl: string) => Promise<{ error: string | null }>;
}) {
  const [uploadingEdit, setUploadingEdit] = useState(false);
  const [submittingDriveLink, setSubmittingDriveLink] = useState(false);
  const [driveLinkUrl, setDriveLinkUrl] = useState(() => readEditedDriveLinkDraft(order.id));
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [removingFileId, setRemovingFileId] = useState<string | null>(null);
  const [removingEditedVideoId, setRemovingEditedVideoId] = useState<string | null>(null);

  function updateDriveLinkUrl(value: string) {
    setDriveLinkUrl(value);
    writeEditedDriveLinkDraft(order.id, value);
  }
  const canDeliver = order.editedVideos.some((video) => video.reviewStatus === "satisfied");
  const submittingEditedVideo = uploadingEdit || submittingDriveLink;

  async function handleEditedVideoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || submittingEditedVideo) return;

    setUploadError(null);
    setUploadingEdit(true);
    const result = await onUploadEdit(order.id, file);
    setUploadingEdit(false);

    if (result.error) {
      setUploadError(result.error);
    }
  }

  async function handleDriveLinkSubmit(event: React.FormEvent) {
    event.preventDefault();

    const cleanDriveUrl = driveLinkUrl.trim();
    if (!cleanDriveUrl || submittingEditedVideo) return;

    if (!isGoogleDriveUrl(cleanDriveUrl)) {
      setUploadError("Please add a valid Google Drive link.");
      return;
    }

    setUploadError(null);
    setSubmittingDriveLink(true);
    const result = await onSubmitEditDriveLink(order.id, cleanDriveUrl);
    setSubmittingDriveLink(false);

    if (result.error) {
      setUploadError(result.error);
      return;
    }

    updateDriveLinkUrl("");
  }

  async function handleDeleteClip(file: OrderFile) {
    if (!onDeleteClip || removingFileId) return;

    setUploadError(null);
    setRemovingFileId(file.id);
    const result = await onDeleteClip(order.id, file);
    setRemovingFileId(null);

    if (result.error) {
      setUploadError(result.error);
      return;
    }

    await onCommentsChanged?.();
  }

  async function handleDeleteEditedVideo(video: EditedVideo) {
    if (!onDeleteEditedVideo || removingEditedVideoId) return;

    setUploadError(null);
    setRemovingEditedVideoId(video.id);
    const result = await onDeleteEditedVideo(video);
    setRemovingEditedVideoId(null);

    if (result.error) {
      setUploadError(result.error);
      return;
    }

    await onCommentsChanged?.();
  }

  const commentViewer = isAdminView
    ? { role: "admin" as const, userId: viewerUserId }
    : { role: "editor" as const, editorId: viewerEditorId };

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
            onChange={(event) => {
              const nextStatus = event.target.value as OrderStatus;
              if (nextStatus === "done" && !canDeliver) return;
              onStatusChange(order.id, nextStatus);
            }}
            className="h-11 rounded-xl border border-white/10 bg-surface-800 px-3 text-sm font-semibold text-white outline-none transition-colors focus:border-brand-400 disabled:opacity-50"
          >
            {ORDER_STATUS_ORDER.filter(
              (status) => status !== "done" || canDeliver || order.status === "done",
            ).map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          {!canDeliver && order.status !== "done" && (
            <p className="text-xs text-gray-500">Delivered unlocks after client satisfaction.</p>
          )}
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
            <div className="rounded-2xl border border-white/10 bg-surface-800/40 p-4 lg:col-span-3">
              <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">
                Original clips
              </p>
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {order.files.map((file) => (
                  <EditorVideoClip
                    key={file.id}
                    file={file}
                    removing={removingFileId === file.id}
                    onDelete={onDeleteClip ? () => handleDeleteClip(file) : undefined}
                  />
                ))}
              </ul>
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

      <div className="mt-5 border-t border-white/10 pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Edited video</p>
            <p className="mt-1 text-sm text-gray-400">
              Upload the final edit for client review. The order moves to In Review.
            </p>
          </div>
          <label
            className={`inline-flex w-fit items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
              submittingEditedVideo
                ? "cursor-not-allowed bg-white/5 text-gray-500"
                : "cursor-pointer bg-brand-600/20 text-brand-300 hover:bg-brand-600/30 hover:text-white"
            }`}
          >
            {uploadingEdit ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileVideo className="h-4 w-4" />
            )}
            {uploadingEdit ? "Uploading..." : "Upload edited video"}
            <input
              type="file"
              accept="video/*"
              disabled={submittingEditedVideo}
              className="hidden"
              onChange={handleEditedVideoUpload}
            />
          </label>
        </div>

        <div className="my-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="rounded-full border border-white/10 bg-surface-800 px-4 py-1 text-xs font-bold uppercase tracking-wide text-gray-400">
            OR
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleDriveLinkSubmit} className="mx-auto max-w-xl">
          <label
            htmlFor={`edited-drive-link-${order.id}`}
            className="mb-2 flex items-center justify-center gap-2 text-sm font-medium text-white"
          >
            <Link2 className="h-4 w-4 text-brand-400" />
            Google Drive link
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id={`edited-drive-link-${order.id}`}
              type="url"
              disabled={submittingEditedVideo}
              value={driveLinkUrl}
              onChange={(event) => updateDriveLinkUrl(event.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full rounded-xl border border-white/10 bg-surface-800/60 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={submittingEditedVideo || !driveLinkUrl.trim()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600/20 px-4 py-2.5 text-xs font-semibold text-brand-300 transition-colors hover:bg-brand-600/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submittingDriveLink ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              {submittingDriveLink ? "Submitting..." : "Submit Drive link"}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500">
            Paste a Google Drive video link if you are not uploading the file here.
          </p>
        </form>

        {uploadError && (
          <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {uploadError}
          </p>
        )}
        {order.editedVideos.length > 0 && (
          <div className="mt-4">
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {order.editedVideos.map((video) => (
                <EditorVideoClip
                  key={video.id}
                  file={video}
                  removing={removingEditedVideoId === video.id}
                  onDelete={
                    onDeleteEditedVideo ? () => handleDeleteEditedVideo(video) : undefined
                  }
                >
                  <div className="mt-2 rounded-2xl border border-white/10 bg-surface-800/60 p-3 text-sm">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <ReviewStatusBadge status={video.reviewStatus} />
                      <span className="text-xs text-gray-500">
                        Uploaded {formatDate(video.createdAt)}
                      </span>
                    </div>
                    <EditedVideoCommentThread
                      editedVideoId={video.id}
                      comments={video.comments}
                      viewer={commentViewer}
                      editorToken={isAdminView ? undefined : editorToken}
                      onChanged={onCommentsChanged}
                      compact
                    />
                  </div>
                </EditorVideoClip>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

function ReviewStatusBadge({ status }: { status: EditedVideo["reviewStatus"] }) {
  const tone =
    status === "satisfied"
      ? "bg-emerald-500/10 text-emerald-300"
      : status === "changes_requested"
        ? "bg-amber-500/10 text-amber-200"
        : "bg-brand-500/10 text-brand-200";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {getReviewStatusLabel(status)}
    </span>
  );
}

type VideoClipSource = OrderFile | EditedVideo;

function ClipDeleteButton({
  onDelete,
  removing,
  label,
}: {
  onDelete: () => void;
  removing: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDelete();
      }}
      disabled={removing}
      className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-gray-300 backdrop-blur transition-colors hover:bg-red-500/20 hover:text-red-300 disabled:opacity-40"
      aria-label={`Remove ${label}`}
      title="Remove clip"
    >
      {removing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}

function EditorVideoClip({
  file,
  children,
  onDelete,
  removing = false,
}: {
  file: VideoClipSource;
  children?: ReactNode;
  onDelete?: () => void;
  removing?: boolean;
}) {
  const [preview, setPreview] = useState<{
    storagePath: string;
    signedUrl: string | null;
  } | null>(null);
  const driveUrl = "driveUrl" in file ? file.driveUrl : undefined;
  const storagePath = file.storagePath;
  const loading = Boolean(storagePath) && preview?.storagePath !== storagePath;
  const signedUrl = loading ? null : preview?.signedUrl;

  useEffect(() => {
    if (!storagePath) {
      return;
    }

    let cancelled = false;

    getSignedFileUrl(storagePath).then((url) => {
      if (cancelled) return;
      setPreview({ storagePath, signedUrl: url });
    });

    return () => {
      cancelled = true;
    };
  }, [storagePath]);

  return (
    <li className="overflow-hidden rounded-2xl border border-white/10 bg-surface-800/60">
      {driveUrl ? (
        <div className="relative">
          {onDelete ? (
            <ClipDeleteButton onDelete={onDelete} removing={removing} label={file.name} />
          ) : null}
          <a
            href={driveUrl}
            target="_blank"
            rel="noreferrer"
            className="flex aspect-video flex-col items-center justify-center gap-3 bg-surface-900/80 px-4 text-center transition-colors hover:bg-surface-900"
          >
            <Link2 className="h-8 w-8 text-brand-300" />
            <span className="text-sm font-medium text-white">Open edited video on Google Drive</span>
            <span className="line-clamp-2 text-xs text-gray-500">{driveUrl}</span>
          </a>
        </div>
      ) : (
        <div className="relative aspect-video bg-black">
          {onDelete ? (
            <ClipDeleteButton onDelete={onDelete} removing={removing} label={file.name} />
          ) : null}
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
      )}
      <div className="flex items-center gap-3 px-4 py-3">
        <FileVideo className="h-5 w-5 shrink-0 text-brand-300" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{file.name}</p>
          <p className="text-xs text-gray-500">
            {driveUrl ? "Google Drive link" : formatSize(file.size)}
          </p>
        </div>
        {driveUrl ? (
          <a
            href={driveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-brand-500/10 hover:text-brand-200"
            aria-label="Open Google Drive link"
            title="Open Google Drive link"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          signedUrl && (
            <a
              href={signedUrl}
              download={file.name}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-brand-500/10 hover:text-brand-200"
              aria-label={`Download ${file.name}`}
              title="Download original clip"
            >
              <Download className="h-4 w-4" />
            </a>
          )
        )}
      </div>
      {children && <div className="px-4 pb-4">{children}</div>}
    </li>
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
