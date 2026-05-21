export type OrderStatus = "received" | "editing" | "review" | "done";

export type OrderFile = {
  name: string;
  size: number;
};

export type Order = {
  id: string;
  userId: string;
  title: string;
  status: OrderStatus;
  files: OrderFile[];
  referenceUrl?: string;
  styleNotes?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "clipcraft_orders";

function readAll(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function getOrdersForUser(userId: string): Order[] {
  return readAll()
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOrderById(userId: string, orderId: string): Order | null {
  return getOrdersForUser(userId).find((o) => o.id === orderId) ?? null;
}

export function createOrder(
  userId: string,
  data: Omit<Order, "id" | "userId" | "status" | "createdAt" | "updatedAt">,
): Order {
  const now = new Date().toISOString();
  const order: Order = {
    id: crypto.randomUUID(),
    userId,
    status: "received",
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  const orders = readAll();
  orders.push(order);
  writeAll(orders);
  return order;
}

export function updateOrderStatus(
  userId: string,
  orderId: string,
  status: OrderStatus,
): Order | null {
  const orders = readAll();
  const index = orders.findIndex((o) => o.id === orderId && o.userId === userId);
  if (index === -1) return null;
  orders[index] = {
    ...orders[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  writeAll(orders);
  return orders[index];
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Received",
  editing: "Editing",
  review: "In Review",
  done: "Delivered",
};

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  "received",
  "editing",
  "review",
  "done",
];
