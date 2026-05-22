import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function EditorRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (role !== "editor" && role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950 p-6">
        <div className="glass max-w-lg rounded-3xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Editor access required
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            This space is only for editors and admins.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
