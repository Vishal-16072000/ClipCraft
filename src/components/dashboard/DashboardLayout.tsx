import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Play,
  LayoutDashboard,
  Upload,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
} from "lucide-react";
import { siteConfig } from "../../data/content";
import { dashboardCopy, dashboardNav } from "../../data/dashboard";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../hooks/useSubscription";
import { activatePendingFreePlanIfNeeded } from "../../lib/subscriptions";

const navIcons = {
  layout: LayoutDashboard,
  upload: Upload,
  folder: FolderOpen,
  settings: Settings,
} as const;

export function DashboardLayout() {
  const { user, role, signOut } = useAuth();
  const { subscription, loading: subscriptionLoading, refresh: refreshSubscription } =
    useSubscription();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activationAttemptKeyRef = useRef<string | null>(null);

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Creator";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  useEffect(() => {
    if (!user) return;
    if (role === "editor" || role === "admin") return;
    if (subscriptionLoading) return;
    if (subscription) return;

    const attemptKey = `${user.id}:free`;
    if (activationAttemptKeyRef.current === attemptKey) return;
    activationAttemptKeyRef.current = attemptKey;

    (async () => {
      const { activated, error } = await activatePendingFreePlanIfNeeded(user.id);
      if (error) {
        activationAttemptKeyRef.current = null;
        console.error("[free-plan] activation failed:", error);
        return;
      }

      if (activated) {
        await refreshSubscription();
        window.dispatchEvent(new Event("clipcraft_subscription_changed"));
      }
    })();
  }, [role, refreshSubscription, subscription, subscriptionLoading, user]);

  const sidebar = (
    <>
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-600/30">
            <Play className="h-4 w-4 fill-white text-white ml-0.5" />
          </div>
          <div>
            <span className="font-display text-lg font-bold text-white tracking-tight block">
              {siteConfig.name}
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              Creator dashboard
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {dashboardNav.map((item) => {
          const Icon = navIcons[item.icon];
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/dashboard"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-600/20 text-white border border-brand-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10 space-y-2">
        {role === "admin" && (
          <Link
            to="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-emerald-300 hover:text-white hover:bg-emerald-500/10 transition-colors"
          >
            <Shield className="h-4 w-4" />
            Admin console
          </Link>
        )}
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          {dashboardCopy.backToSite}
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {dashboardCopy.signOut}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface-950 flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/10 bg-surface-900/50 p-5">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-white/10 bg-surface-900 p-5 transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebar}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-surface-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4">
            <button
              type="button"
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{displayName}</p>
                <p className="text-xs text-gray-500 truncate max-w-[180px]">
                  {user?.email}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
