import { ShieldCheck } from "lucide-react";
import { adminCopy } from "../../data/admin";
import { useAuth } from "../../contexts/AuthContext";

export function AdminSettingsPage() {
  const { user, role } = useAuth();

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            {adminCopy.settingsTitle}
          </h1>
          <p className="mt-2 text-gray-400">{adminCopy.settingsSubtitle}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="glass rounded-2xl p-5 sm:p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="font-display text-lg font-bold text-white">
              Current admin
            </h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">Email</dt>
                <dd className="mt-1 text-white">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">Role</dt>
                <dd className="mt-1 text-emerald-300">{role}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">User ID</dt>
                <dd className="mt-1 break-all font-mono text-xs text-gray-400">
                  {user?.id}
                </dd>
              </div>
            </dl>
          </section>

          <section className="glass rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-white">
              Setup notes
            </h2>
            <div className="mt-4 space-y-3 text-sm text-gray-400">
              <p>
                Admin access is controlled by the `public.profiles.role` value in
                Supabase.
              </p>
              <p>
                To add another admin, create the user in Supabase Auth, then set
                their profile role to `admin`.
              </p>
              <p className="rounded-2xl border border-white/10 bg-surface-800/60 p-4 text-xs text-gray-300">
                update public.profiles set role = 'admin' where email =
                'admin@example.com';
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
