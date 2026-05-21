import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

/** Legacy route — logged-in users go to the dashboard upload flow. */
export function UploadPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // unauthenticated handled by Navigate below
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 className="h-8 w-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard/upload" replace />;
  }

  return <Navigate to="/signin" replace />;
}
