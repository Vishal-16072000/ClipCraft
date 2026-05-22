import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type AppRole = "user" | "admin" | "editor";

type EditorSession = {
  id: string;
  email: string;
  accessToken: string;
  createdAt: string;
  updatedAt: string;
};

type EditorSignInRow = {
  id: string;
  email: string;
  access_token: string;
  created_at: string;
  updated_at: string;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  editor: EditorSession | null;
  loading: boolean;
  configured: boolean;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; role: AppRole | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshRole: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const EDITOR_SESSION_KEY = "clipcraft_editor_session";

function formatAuthError(message: string) {
  if (message.includes("Invalid login credentials")) {
    return "Invalid email or password. Please try again.";
  }
  if (message.includes("Email not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  return message;
}

function loadStoredEditorSession(): EditorSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(EDITOR_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<EditorSession>;

    if (!parsed.id || !parsed.email || !parsed.accessToken) {
      window.localStorage.removeItem(EDITOR_SESSION_KEY);
      return null;
    }

    return parsed as EditorSession;
  } catch {
    return null;
  }
}

function storeEditorSession(editor: EditorSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(EDITOR_SESSION_KEY, JSON.stringify(editor));
}

function clearStoredEditorSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(EDITOR_SESSION_KEY);
}

function createEditorUser(editor: EditorSession): User {
  return {
    id: editor.id,
    aud: "editor",
    role: "editor",
    email: editor.email,
    email_confirmed_at: editor.createdAt,
    app_metadata: { provider: "editor", providers: ["editor"] },
    user_metadata: { role: "editor" },
    created_at: editor.createdAt,
    updated_at: editor.updatedAt,
  } as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialEditor = loadStoredEditorSession();
  const [user, setUser] = useState<User | null>(
    initialEditor ? createEditorUser(initialEditor) : null,
  );
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(initialEditor ? "editor" : null);
  const [editor, setEditor] = useState<EditorSession | null>(initialEditor);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      const timeoutId = window.setTimeout(() => setLoading(false), 0);
      return () => window.clearTimeout(timeoutId);
    }

    async function loadProfileRole(nextUser: User | null) {
      if (!supabase || !nextUser) {
        setRole(null);
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin");

      if (isAdmin === true) {
        setRole("admin");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", nextUser.id)
        .maybeSingle();

      if (error) {
        setRole(null);
        return;
      }

      setRole(data?.role === "admin" ? "admin" : "user");
    }

    supabase.auth.getSession().then(({ data }) => {
      const storedEditor = loadStoredEditorSession();
      if (storedEditor) {
        setEditor(storedEditor);
        setUser(createEditorUser(storedEditor));
        setSession(null);
        setRole("editor");
        setLoading(false);
        return;
      }

      const nextUser = data.session?.user ?? null;
      setSession(data.session);
      setUser(nextUser);
      loadProfileRole(nextUser).finally(() => setLoading(false));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const storedEditor = loadStoredEditorSession();
      if (storedEditor) {
        setEditor(storedEditor);
        setSession(null);
        setUser(createEditorUser(storedEditor));
        setRole("editor");
        setLoading(false);
        return;
      }

      const nextUser = nextSession?.user ?? null;
      setLoading(true);
      setSession(nextSession);
      setUser(nextUser);
      loadProfileRole(nextUser).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshRole = useCallback(async () => {
    if (!supabase || !user) {
      if (!editor) {
        setRole(null);
      }
      return;
    }

    const { data: isAdmin } = await supabase.rpc("is_admin");

    if (isAdmin === true) {
      setRole("admin");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    setRole(data?.role === "admin" ? "admin" : "user");
  }, [editor, user]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return {
        error: "Supabase is not configured. Add your env keys and restart the dev server.",
        role: null,
      };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error) {
      clearStoredEditorSession();
      setEditor(null);
      return { error: null, role: null };
    }

    if (!error.message.includes("Invalid login credentials")) {
      return { error: formatAuthError(error.message), role: null };
    }

    const { data, error: editorError } = await supabase.rpc("editor_sign_in", {
      editor_email: email,
      editor_password: password,
    });

    if (editorError) {
      return { error: editorError.message, role: null };
    }

    const editorRow = (data as EditorSignInRow[] | null)?.[0];

    if (!editorRow) {
      return { error: formatAuthError(error.message), role: null };
    }

    const nextEditor = {
      id: editorRow.id,
      email: editorRow.email,
      accessToken: editorRow.access_token,
      createdAt: editorRow.created_at,
      updatedAt: editorRow.updated_at,
    };

    storeEditorSession(nextEditor);
    setEditor(nextEditor);
    setSession(null);
    setUser(createEditorUser(nextEditor));
    setRole("editor");

    return { error: null, role: "editor" as const };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { error: "Supabase is not configured. Add your env keys and restart the dev server." };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error ? formatAuthError(error.message) : null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      return { error: "Supabase is not configured. Add your env keys and restart the dev server." };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    return { error: error ? formatAuthError(error.message) : null };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) {
      return { error: "Supabase is not configured. Add your env keys and restart the dev server." };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/signin`,
    });
    return { error: error ? formatAuthError(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    clearStoredEditorSession();
    setEditor(null);
    setUser(null);
    setSession(null);
    setRole(null);

    if (supabase) {
      await supabase.auth.signOut();
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      role,
      editor,
      loading,
      configured: isSupabaseConfigured,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      resetPassword,
      refreshRole,
      signOut,
    }),
    [
      user,
      session,
      role,
      editor,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      resetPassword,
      refreshRole,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
