import {
  CheckCircle2,
  Clock,
  FolderOpen,
  Loader2,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminCopy } from "../../data/admin";
import { ORDER_STATUS_LABELS } from "../../lib/orders";
import { useAdminOrders, useAdminProfiles } from "../../hooks/useAdminData";
import { StatusBadge } from "../../components/dashboard/StatusBadge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminOverviewPage() {
  const { orders, loading: ordersLoading, error: ordersError } = useAdminOrders();
  const { profiles, loading: profilesLoading, error: profilesError } = useAdminProfiles();

  const loading = ordersLoading || profilesLoading;
  const error = ordersError ?? profilesError;
  const active = orders.filter((order) => order.status !== "done").length;
  const received = orders.filter((order) => order.status === "received").length;
  const editing = orders.filter((order) => order.status === "editing").length;
  const review = orders.filter((order) => order.status === "review").length;
  const done = orders.filter((order) => order.status === "done").length;
  const recent = orders.slice(0, 6);

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 mesh-gradient">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            {adminCopy.overviewTitle}
          </h1>
          <p className="mt-2 text-gray-400">{adminCopy.overviewSubtitle}</p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <div className="glass rounded-3xl p-12 text-center text-gray-400">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-brand-400" />
            Loading admin overview...
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard
                label="Total users"
                value={String(profiles.length)}
                icon={<Users className="h-5 w-5 text-cyan-300" />}
              />
              <StatCard
                label="Total orders"
                value={String(orders.length)}
                icon={<FolderOpen className="h-5 w-5 text-brand-300" />}
              />
              <StatCard
                label="Active edits"
                value={String(active)}
                icon={<Sparkles className="h-5 w-5 text-amber-300" />}
              />
              <StatCard
                label="In review"
                value={String(review)}
                icon={<MessageCircle className="h-5 w-5 text-fuchsia-300" />}
              />
              <StatCard
                label="Delivered"
                value={String(done)}
                icon={<CheckCircle2 className="h-5 w-5 text-emerald-300" />}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <section className="glass rounded-2xl p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="font-display text-lg font-bold text-white">
                    Recent orders
                  </h2>
                  <Link
                    to="/admin/orders"
                    className="text-sm font-semibold text-brand-300 hover:text-white"
                  >
                    View all
                  </Link>
                </div>

                {recent.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
                    <FolderOpen className="mx-auto mb-3 h-10 w-10 text-gray-600" />
                    <p className="font-semibold text-white">No orders yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Client uploads will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="text-xs uppercase tracking-wide text-gray-500">
                        <tr className="border-b border-white/10">
                          <th className="pb-3 font-medium">Order</th>
                          <th className="pb-3 font-medium">Client</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Files</th>
                          <th className="pb-3 font-medium">Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map((order) => (
                          <tr key={order.id} className="border-b border-white/5">
                            <td className="py-4 font-semibold text-white">{order.title}</td>
                            <td className="py-4 text-gray-400">
                              {order.customerEmail ?? order.userId.slice(0, 8)}
                            </td>
                            <td className="py-4">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="py-4 text-gray-400">
                              {order.files.length || (order.footageUrl ? "Drive" : 0)}
                            </td>
                            <td className="py-4 text-gray-500">
                              {formatDate(order.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="glass rounded-2xl p-5 sm:p-6">
                <h2 className="font-display text-lg font-bold text-white">
                  Pipeline
                </h2>
                <div className="mt-5 space-y-4">
                  {[
                    ["received", received],
                    ["editing", editing],
                    ["review", review],
                    ["done", done],
                  ].map(([status, value]) => (
                    <div key={status}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          {ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS]}
                        </span>
                        <span className="font-semibold text-white">{value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-600">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-400"
                          style={{
                            width: `${orders.length ? (Number(value) / orders.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-white/10 bg-surface-800/60 p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-300" />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Priority queue
                      </p>
                      <p className="text-xs text-gray-500">
                        {received + editing + review} items need ops attention.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">{icon}</div>
      <p className="font-display text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}
