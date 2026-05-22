import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading, refreshRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 className="h-8 w-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
        <div className="glass max-w-lg rounded-3xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Admin access required
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            This account is signed in, but it is not marked as an admin in
            Supabase profiles.
          </p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-surface-800/70 p-4 text-left text-xs text-gray-400">
            <p className="font-semibold text-white">Signed-in account</p>
            <p className="mt-2 break-all">Email: {user.email ?? "Not available"}</p>
            <p className="mt-1 break-all">UID: {user.id}</p>
            <p className="mt-1">Loaded role: {role ?? "none"}</p>
          </div>
          <button
            type="button"
            onClick={() => refreshRole()}
            className="mt-5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
          >
            Refresh access
          </button>
        </div>
      </div>
    );
  }

  return children;
}
