import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  FolderOpen,
  Clock,
  Sparkles,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useAssignedEditor } from "../../hooks/useAssignedEditor";
import { useOrders } from "../../hooks/useOrders";
import { useSubscription } from "../../hooks/useSubscription";
import { dashboardCopy } from "../../data/dashboard";
import { OrderCard } from "../../components/dashboard/OrderCard";
import { getPlanDisplayName, getTotalEdits } from "../../lib/subscriptions";

function formatEditorName(email: string) {
  return email
    .split("@")[0]
    .split(/[._\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function DashboardOverviewPage() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const { subscription } = useSubscription();
  const { editor, loading: editorLoading, error: editorError } = useAssignedEditor();

  const active = orders.filter((o) => o.status !== "done").length;
  const inReview = orders.filter((o) => o.status === "review").length;
  const delivered = orders.filter((o) => o.status === "done").length;
  const recent = orders.slice(0, 4);

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Creator";

  const [now] = useState(() => Date.now());
  const hasActivePlan = Boolean(
    subscription && new Date(subscription.currentPeriodEnd).getTime() > now,
  );

  const currentPeriodStartMs = subscription
    ? new Date(subscription.currentPeriodStart).getTime()
    : 0;
  const currentPeriodEndMs = subscription
    ? new Date(subscription.currentPeriodEnd).getTime()
    : 0;

  const usedEdits = hasActivePlan
    ? orders.filter((o) => {
        const createdAtMs = new Date(o.createdAt).getTime();
        return createdAtMs >= currentPeriodStartMs && createdAtMs <= currentPeriodEndMs;
      }).length
    : 0;

  const totalEdits = subscription ? getTotalEdits(subscription.planId, subscription.billingCycle) : null;
  const usagePercent =
    totalEdits !== null && totalEdits > 0 ? Math.round((usedEdits / totalEdits) * 100) : 0;

  const renewsInLabel = hasActivePlan
    ? (() => {
        const diffMs = currentPeriodEndMs - now;
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (!Number.isFinite(days)) return "—";
        if (days <= 0) return "Renewing…";
        return `Renews in ${days} day${days === 1 ? "" : "s"}`;
      })()
    : "after plan activation";
  const editorName = editor ? formatEditorName(editor.email) : "Not assigned yet";
  const editorInitials = editor
    ? editor.email
        .split("@")[0]
        .split(/[._\s-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "ED"
    : "--";

  return (
    <div className="p-4 sm:p-6 lg:p-8 mesh-gradient min-h-full">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            {dashboardCopy.welcome}, {displayName}
          </h1>
          <p className="mt-2 text-gray-400">{dashboardCopy.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
          <Link
            to="/dashboard/upload"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-600/25"
          >
            <Upload className="h-4 w-4" />
            {dashboardCopy.newUpload}
          </Link>
          <Link
            to="/dashboard/orders"
            className="inline-flex items-center gap-2 glass text-white font-medium px-5 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <FolderOpen className="h-4 w-4" />
            {dashboardCopy.viewAllOrders}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label={dashboardCopy.activeProjects}
            value={String(active)}
            icon={<Sparkles className="h-5 w-5 text-brand-400" />}
          />
          <StatCard
            label={dashboardCopy.inProduction}
            value={String(
              orders.filter((o) => o.status === "editing" || o.status === "received")
                .length,
            )}
            icon={<Clock className="h-5 w-5 text-amber-400" />}
          />
          <StatCard
            label={dashboardCopy.readyForReview}
            value={String(inReview)}
            icon={<MessageCircle className="h-5 w-5 text-brand-300" />}
          />
          <StatCard
            label={dashboardCopy.delivered}
            value={String(delivered)}
            icon={<FolderOpen className="h-5 w-5 text-emerald-400" />}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-white">
                {dashboardCopy.recentOrders}
              </h2>
              {orders.length > 0 && (
                <Link
                  to="/dashboard/orders"
                  className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {recent.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-14 w-14 rounded-2xl bg-brand-600/20 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-7 w-7 text-brand-400" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">
                  {dashboardCopy.noOrdersTitle}
                </h3>
                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                  {dashboardCopy.noOrdersDescription}
                </p>
                <Link
                  to="/dashboard/upload"
                  className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-brand-400 hover:text-brand-300"
                >
                  {dashboardCopy.newUpload}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map((order) => (
                  <OrderCard key={order.id} order={order} compact />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass rounded-2xl p-5 sm:p-6 glow-brand">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {dashboardCopy.yourEditor}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-sm font-bold text-white">
                  {editorLoading ? "..." : editorInitials}
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {editorLoading ? "Loading..." : editorName}
                  </p>
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        editor ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    {editor ? "Assigned to your account" : "Awaiting assignment"}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                {editorError
                  ? editorError
                  : editor
                    ? `${editor.email} is assigned to your uploads.`
                    : "Your editor will appear here once an admin assigns one to your account."}
              </p>
              <button
                type="button"
                disabled={!editor}
                className="mt-4 w-full text-sm font-semibold text-brand-300 bg-brand-500/15 hover:bg-brand-500/25 py-2.5 rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Message editor
              </button>
            </div>

            <div className="glass rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {dashboardCopy.planLabel}
                </p>
                <span className="text-xs font-semibold text-brand-300 bg-brand-500/15 px-2 py-0.5 rounded-full">
                  {hasActivePlan && subscription
                    ? getPlanDisplayName(subscription.planId)
                    : "No Plan"}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-2">{dashboardCopy.planDescription}</p>

              {hasActivePlan ? (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500">{dashboardCopy.editsRemaining}</span>
                    <span className="text-white font-medium">
                      {totalEdits === null ? "Unlimited" : `${totalEdits - usedEdits} / ${totalEdits}`}
                    </span>
                  </div>
                  {totalEdits !== null && (
                    <div className="h-2 rounded-full bg-surface-600 overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{renewsInLabel}</p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-sm font-semibold text-white">No Plan Active</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Select a plan to start sending edits to your dedicated editor.
                  </p>
                </div>
              )}

              <a
                href="/#pricing"
                className="mt-4 block text-center text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors"
              >
                {dashboardCopy.upgradeCta}
              </a>
            </div>

            <div className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-brand-600/20 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{dashboardCopy.nextDelivery}</p>
                <p className="font-display text-xl font-bold text-brand-300">
                  {active > 0 ? "18h" : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
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
      <div className="flex items-center justify-between mb-3">{icon}</div>
      <p className="font-display text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
