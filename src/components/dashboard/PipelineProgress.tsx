import { ORDER_STATUS_ORDER, ORDER_STATUS_LABELS, type OrderStatus } from "../../lib/orders";

export function PipelineProgress({ status }: { status: OrderStatus }) {
  const currentIndex = ORDER_STATUS_ORDER.indexOf(status);

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {ORDER_STATUS_ORDER.map((stage, i) => {
        const isComplete = i < currentIndex || (status === "done" && i === currentIndex);
        const isCurrent = i === currentIndex && !isComplete;
        return (
          <div key={stage} className="flex items-center gap-1 sm:gap-2">
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isComplete
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                      : "bg-surface-600 text-gray-500"
                }`}
              >
                {isComplete ? "✓" : i + 1}
              </div>
              <span
                className={`text-[10px] mt-1.5 hidden sm:block ${
                  isCurrent ? "text-white font-medium" : "text-gray-500"
                }`}
              >
                {ORDER_STATUS_LABELS[stage]}
              </span>
            </div>
            {i < ORDER_STATUS_ORDER.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-px ${
                  i < currentIndex ? "bg-emerald-600/60" : "bg-surface-500"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
