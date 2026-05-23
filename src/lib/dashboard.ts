import { supabase } from "./supabase";

export type AssignedEditor = {
  id: string;
  email: string;
  assignedAt: string;
};

type AssignedEditorRow = {
  id: string;
  email: string;
  assigned_at: string;
};

function mapAssignedEditor(row: AssignedEditorRow): AssignedEditor {
  return {
    id: row.id,
    email: row.email,
    assignedAt: row.assigned_at,
  };
}

function isMissingAssignedEditorRpcError(message: string) {
  return (
    message.includes("client_get_assigned_editor") &&
    message.includes("schema cache")
  );
}

export async function fetchAssignedEditor(): Promise<{
  editor: AssignedEditor | null;
  error: string | null;
}> {
  if (!supabase) {
    return { editor: null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase.rpc("client_get_assigned_editor");

  if (error) {
    if (isMissingAssignedEditorRpcError(error.message)) {
      return { editor: null, error: null };
    }

    return { editor: null, error: error.message };
  }

  const row = (data as AssignedEditorRow[] | null)?.[0];
  return { editor: row ? mapAssignedEditor(row) : null, error: null };
}
