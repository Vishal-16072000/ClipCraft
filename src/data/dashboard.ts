import type { OrderStatus } from "../lib/orders";

export const dashboardNav = [
  { label: "Overview", href: "/dashboard", icon: "layout" as const },
  { label: "New Upload", href: "/dashboard/upload", icon: "upload" as const },
  { label: "My Orders", href: "/dashboard/orders", icon: "folder" as const },
  { label: "Settings", href: "/dashboard/settings", icon: "settings" as const },
] as const;

export const dashboardCopy = {
  welcome: "Welcome back",
  subtitle: "Track edits, upload footage, and ship faster.",
  newUpload: "New upload",
  viewAllOrders: "View all orders",
  activeProjects: "Active projects",
  inProduction: "In production",
  readyForReview: "Ready for review",
  delivered: "Delivered this month",
  editsRemaining: "Edits remaining",
  nextDelivery: "Next delivery",
  yourEditor: "Your editor",
  editorName: "Sameep K.",
  editorStatus: "Online · Replies within 2h",
  editorMessage: "Reel #2 hooks locked — ready for your review.",
  recentOrders: "Recent orders",
  noOrdersTitle: "No orders yet",
  noOrdersDescription:
    "Upload your first batch of raw footage and your dedicated editor will take it from there.",
  planLabel: "Current plan",
  planName: "No Plan Active",
  planDescription: "Choose a plan to unlock monthly edits and priority delivery.",
  upgradeCta: "View plans",
  turnaround: "48hr turnaround",
  uploadTitle: "New upload",
  uploadSubtitle:
    "Upload raw footage, add references and style notes. Your editor takes it from here.",
  ordersTitle: "My orders",
  ordersSubtitle: "Track every project from upload to delivery.",
  settingsTitle: "Account settings",
  settingsSubtitle: "Manage your profile and subscription.",
  signOut: "Sign out",
  backToSite: "Back to site",
};

export const demoPlanUsage = {
  used: 0,
  total: 0,
  renewsIn: "after plan activation",
};

export const statusColors: Record<
  OrderStatus,
  { bg: string; text: string; dot: string }
> = {
  received: {
    bg: "bg-blue-500/10",
    text: "text-blue-300",
    dot: "bg-blue-400",
  },
  editing: {
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    dot: "bg-amber-400",
  },
  review: {
    bg: "bg-brand-500/10",
    text: "text-brand-300",
    dot: "bg-brand-400",
  },
  done: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
  },
};
