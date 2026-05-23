import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchAssignedEditor, type AssignedEditor } from "../lib/dashboard";

export function useAssignedEditor() {
  const { user } = useAuth();
  const [editor, setEditor] = useState<AssignedEditor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setEditor(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { editor: data, error: err } = await fetchAssignedEditor();
    setEditor(data);
    setError(err);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { editor, loading, error, refresh };
}
