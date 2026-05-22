import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RefreshCw,
  Scissors,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { adminCopy } from "../../data/admin";
import { useAdminEditors, useAdminProfiles } from "../../hooks/useAdminData";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminEditorsPage() {
  const {
    editors,
    loading,
    error,
    refresh,
    createEditor,
    assignClient,
    removeClient,
  } = useAdminEditors();
  const { profiles } = useAdminProfiles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedClients, setSelectedClients] = useState<Record<string, string>>({});
  const [assignmentKey, setAssignmentKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clientProfiles = profiles.filter((profile) => profile.role === "user");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setSuccess(null);
    setSaving(true);

    const result = await createEditor(email.trim(), password);
    setSaving(false);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    setEmail("");
    setPassword("");
    setSuccess("Editor added. They can use these credentials for Editor Space.");
  }

  async function handleAssign(editorId: string) {
    const userId = selectedClients[editorId];

    if (!userId) {
      setActionError("Select a client first.");
      return;
    }

    setActionError(null);
    setSuccess(null);
    setAssignmentKey(`${editorId}:${userId}:assign`);
    const result = await assignClient(editorId, userId);
    setAssignmentKey(null);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    setSelectedClients((current) => ({ ...current, [editorId]: "" }));
    setSuccess("Client assigned to editor.");
  }

  async function handleRemove(editorId: string, userId: string) {
    setActionError(null);
    setSuccess(null);
    setAssignmentKey(`${editorId}:${userId}:remove`);
    const result = await removeClient(editorId, userId);
    setAssignmentKey(null);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    setSuccess("Client removed from editor.");
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {adminCopy.editorsTitle}
            </h1>
            <p className="mt-2 text-gray-400">{adminCopy.editorsSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {(error || actionError) && (
          <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error ?? actionError}
          </p>
        )}

        {success && (
          <p className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </p>
        )}

        <section className="glass mb-6 rounded-2xl p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/20 text-brand-200">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Add editor</h2>
              <p className="text-sm text-gray-500">
                Email and password are required before an editor can enter Editor Space.
              </p>
            </div>
          </div>

          <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Editor email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="editor@example.com"
                className="h-12 w-full rounded-xl border border-white/10 bg-surface-800 px-4 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-brand-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Password
              </span>
              <div className="flex h-12 overflow-hidden rounded-xl border border-white/10 bg-surface-800 transition-colors focus-within:border-brand-400">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                  required
                  placeholder="Minimum 6 characters"
                  className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="flex w-12 items-center justify-center text-gray-400 transition-colors hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 self-end rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Add editor
            </button>
          </form>
        </section>

        {loading ? (
          <div className="glass rounded-3xl p-12 text-center text-gray-400">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-brand-400" />
            Loading editors...
          </div>
        ) : editors.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <Scissors className="mx-auto mb-4 h-12 w-12 text-brand-400 opacity-60" />
            <h2 className="font-display text-xl font-bold text-white">No editors yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Add the first editor above to unlock Editor Space access.
            </p>
          </div>
        ) : (
          <div className="glass overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Editor</th>
                    <th className="px-5 py-4 font-medium">Password</th>
                    <th className="px-5 py-4 font-medium">Assigned clients</th>
                    <th className="px-5 py-4 font-medium">Assign client</th>
                    <th className="px-5 py-4 font-medium">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {editors.map((editor) => (
                    <tr key={editor.id} className="border-t border-white/10">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600/20 text-brand-200">
                            <Scissors className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{editor.email}</p>
                            <p className="text-xs text-gray-500">
                              Updated {formatDate(editor.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                          {editor.passwordSet ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <KeyRound className="h-3 w-3" />
                          )}
                          {editor.passwordSet ? "Password set" : "Missing"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-300">
                        {editor.assignedClients.length > 0 ? (
                          <div className="flex max-w-[320px] flex-wrap gap-1.5">
                            {editor.assignedClients.map((client) => (
                              <button
                                key={client.id}
                                type="button"
                                onClick={() => handleRemove(editor.id, client.id)}
                                disabled={assignmentKey === `${editor.id}:${client.id}:remove`}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-gray-300 transition-colors hover:bg-red-500/10 hover:text-red-200 disabled:opacity-50"
                                title={`Remove ${client.email}`}
                              >
                                {client.email}
                                {assignmentKey === `${editor.id}:${client.id}:remove` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <UserMinus className="h-3 w-3" />
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-gray-500">
                            <Users className="h-4 w-4" />
                            No clients assigned
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex min-w-[260px] gap-2">
                          <select
                            value={selectedClients[editor.id] ?? ""}
                            onChange={(event) =>
                              setSelectedClients((current) => ({
                                ...current,
                                [editor.id]: event.target.value,
                              }))
                            }
                            className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-surface-800 px-3 text-sm text-white outline-none transition-colors focus:border-brand-400"
                          >
                            <option value="">Select client</option>
                            {clientProfiles.map((profile) => (
                              <option key={profile.id} value={profile.id}>
                                {profile.email}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleAssign(editor.id)}
                            disabled={
                              !selectedClients[editor.id] ||
                              assignmentKey?.startsWith(`${editor.id}:`)
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {assignmentKey?.startsWith(`${editor.id}:`) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserPlus className="h-4 w-4" />
                            )}
                            Assign
                          </button>
                        </div>
                        <p className="mt-2 font-mono text-xs text-gray-600">{editor.id}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-400">
                        {formatDate(editor.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
