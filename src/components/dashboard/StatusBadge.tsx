import { ORDER_STATUS_LABELS, type OrderStatus } from "../../lib/orders";
import { statusColors } from "../../data/dashboard";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const colors = statusColors[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
