export const adminNav = [
  { label: "Overview", href: "/admin", icon: "layout" as const },
  { label: "Orders", href: "/admin/orders", icon: "folder" as const },
  { label: "Users", href: "/admin/users", icon: "users" as const },
  { label: "Settings", href: "/admin/settings", icon: "settings" as const },
] as const;

export const adminCopy = {
  title: "Admin console",
  subtitle: "Full ClipCraft operations overview.",
  overviewTitle: "Operations overview",
  overviewSubtitle: "Track uploads, active edits, reviews, and deliveries.",
  ordersTitle: "All orders",
  ordersSubtitle: "Review client uploads and move work through the pipeline.",
  usersTitle: "Users",
  usersSubtitle: "Manage client and admin access.",
  settingsTitle: "Admin settings",
  settingsSubtitle: "Account and setup details for this console.",
  backToDashboard: "Creator dashboard",
  backToSite: "Back to site",
  signOut: "Sign out",
};
