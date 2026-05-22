import { Loader2, Shield, UserRound } from "lucide-react";
import { adminCopy } from "../../data/admin";
import { useAdminProfiles } from "../../hooks/useAdminData";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminUsersPage() {
  const { profiles, loading, error } = useAdminProfiles();

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            {adminCopy.usersTitle}
          </h1>
          <p className="mt-2 text-gray-400">{adminCopy.usersSubtitle}</p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <div className="glass rounded-3xl p-12 text-center text-gray-400">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-brand-400" />
            Loading users...
          </div>
        ) : (
          <div className="glass overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">User</th>
                    <th className="px-5 py-4 font-medium">Role</th>
                    <th className="px-5 py-4 font-medium">User ID</th>
                    <th className="px-5 py-4 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="border-t border-white/10">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600/20 text-brand-200">
                            <UserRound className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{profile.email}</p>
                            <p className="text-xs text-gray-500">
                              {profile.role === "admin" ? "Team member" : "Client"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            profile.role === "admin"
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-white/5 text-gray-300"
                          }`}
                        >
                          {profile.role === "admin" && <Shield className="h-3 w-3" />}
                          {profile.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">
                        {profile.id}
                      </td>
                      <td className="px-5 py-4 text-gray-400">
                        {formatDate(profile.createdAt)}
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
