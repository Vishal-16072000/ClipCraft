import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ExternalLink,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  Play,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { adminCopy, adminNav } from "../../data/admin";
import { siteConfig } from "../../data/content";

const navIcons = {
  layout: LayoutDashboard,
  folder: FolderOpen,
  users: Users,
  editors: Scissors,
  settings: Settings,
} as const;

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Admin";

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

  const sidebar = (
    <>
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <Link to="/admin" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-brand-700 shadow-lg shadow-emerald-600/20">
            <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
          </div>
          <div>
            <span className="block font-display text-lg font-bold tracking-tight text-white">
              {siteConfig.name}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500">
              Admin console
            </span>
          </div>
        </Link>
      </div>

      <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">
        <span className="inline-flex items-center gap-2">
          <Shield className="h-3.5 w-3.5" />
          Admin access active
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {adminNav.map((item) => {
          const Icon = navIcons[item.icon];
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/admin"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border border-brand-500/30 bg-brand-600/20 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/10 pt-6">
        <Link
          to="/editor"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Scissors className="h-4 w-4" />
          Editor Space
        </Link>
        <Link
          to="/dashboard"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LayoutDashboard className="h-4 w-4" />
          {adminCopy.backToDashboard}
        </Link>
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          {adminCopy.backToSite}
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          {adminCopy.signOut}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-surface-950">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-surface-900/50 p-5 lg:flex">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-surface-900 p-5 transition-transform lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 hover:text-white"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-surface-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="rounded-lg p-2 text-gray-400 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-white">{displayName}</p>
                <p className="max-w-[180px] truncate text-xs text-gray-500">
                  {user?.email}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-brand-700 text-xs font-bold text-white">
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
