import { Link } from "react-router-dom";
import { Upload, Filter } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getOrdersForUser, ORDER_STATUS_LABELS, type OrderStatus } from "../../lib/orders";
import { dashboardCopy } from "../../data/dashboard";
import { OrderCard } from "../../components/dashboard/OrderCard";

const filters: Array<{ id: "all" | OrderStatus; label: string }> = [
  { id: "all", label: "All" },
  ...(["received", "editing", "review", "done"] as OrderStatus[]).map((s) => ({
    id: s,
    label: ORDER_STATUS_LABELS[s],
  })),
];

export function DashboardOrdersPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const orders = user ? getOrdersForUser(user.id) : [];

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-full">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {dashboardCopy.ordersTitle}
            </h1>
            <p className="mt-2 text-gray-400">{dashboardCopy.ordersSubtitle}</p>
          </div>
          <Link
            to="/dashboard/upload"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold px-5 py-2.5 rounded-xl w-fit"
          >
            <Upload className="h-4 w-4" />
            {dashboardCopy.newUpload}
          </Link>
        </div>

        {orders.length > 0 && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 text-gray-500 shrink-0" />
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.id
                    ? "bg-brand-600 text-white"
                    : "glass text-gray-400 hover:text-white"
                }`}
              >
                {f.label}
                {f.id !== "all" && (
                  <span className="ml-1.5 opacity-70">
                    ({orders.filter((o) => o.status === f.id).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <Upload className="h-12 w-12 text-brand-400 mx-auto mb-4 opacity-60" />
            <h2 className="font-display text-xl font-bold text-white">
              {orders.length === 0
                ? dashboardCopy.noOrdersTitle
                : "No orders in this status"}
            </h2>
            <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
              {orders.length === 0
                ? dashboardCopy.noOrdersDescription
                : "Try a different filter or submit a new upload."}
            </p>
            {orders.length === 0 && (
              <Link
                to="/dashboard/upload"
                className="inline-flex items-center gap-2 mt-6 text-brand-400 hover:text-brand-300 font-semibold text-sm"
              >
                <Upload className="h-4 w-4" />
                {dashboardCopy.newUpload}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
