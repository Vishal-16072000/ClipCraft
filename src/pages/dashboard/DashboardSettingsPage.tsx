import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Mail, User, CreditCard, Bell, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { dashboardCopy } from "../../data/dashboard";
import { useOrders } from "../../hooks/useOrders";
import { useSubscription } from "../../hooks/useSubscription";
import { getPlanDisplayName, getTotalEdits } from "../../lib/subscriptions";

export function DashboardSettingsPage() {
  const { user, updateProfileName } = useAuth();
  const { orders } = useOrders();
  const { subscription } = useSubscription();
  const [notifications, setNotifications] = useState(true);
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "";
  const [now] = useState(() => Date.now());
  const hasActivePlan = Boolean(
    subscription && new Date(subscription.currentPeriodEnd).getTime() > now,
  );

  const currentPeriodStartMs = subscription
    ? new Date(subscription.currentPeriodStart).getTime()
    : 0;
  const currentPeriodEndMs = subscription
    ? new Date(subscription.currentPeriodEnd).getTime()
    : 0;

  const usedEdits = hasActivePlan
    ? orders.filter((o) => {
        const createdAtMs = new Date(o.createdAt).getTime();
        return createdAtMs >= currentPeriodStartMs && createdAtMs <= currentPeriodEndMs;
      }).length
    : 0;

  const totalEdits = subscription ? getTotalEdits(subscription.planId, subscription.billingCycle) : null;
  const renewsInLabel = hasActivePlan
    ? (() => {
        const diffMs = currentPeriodEndMs - now;
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (!Number.isFinite(days)) return "—";
        if (days <= 0) return "Renewing…";
        return `Renews in ${days} day${days === 1 ? "" : "s"}`;
      })()
    : null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayNameInput(displayName);
  }, [displayName]);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setSavingProfile(true);

    const result = await updateProfileName(displayNameInput);
    setSavingProfile(false);

    if (result.error) {
      setProfileError(result.error);
      return;
    }

    setProfileSuccess("Profile name updated.");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-full">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            {dashboardCopy.settingsTitle}
          </h1>
          <p className="mt-2 text-gray-400">{dashboardCopy.settingsSubtitle}</p>
        </div>

        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
            <User className="h-4 w-4 text-brand-400" />
            Profile
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-xs text-gray-500 mb-1.5">
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                required
                value={displayNameInput}
                onChange={(event) => setDisplayNameInput(event.target.value)}
                className="w-full rounded-xl bg-surface-700/50 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs text-gray-500 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  disabled
                  readOnly
                  value={user?.email ?? ""}
                  className="w-full rounded-xl bg-surface-700/30 border border-white/10 px-4 py-3 pl-11 text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1.5">
                Email is managed through your sign-in provider.
              </p>
            </div>
            {profileError && (
              <p className="flex gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {profileError}
              </p>
            )}
            {profileSuccess && (
              <p className="flex gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {profileSuccess}
              </p>
            )}
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 transition-colors hover:text-brand-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save profile
            </button>
          </form>
        </section>

        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
            <CreditCard className="h-4 w-4 text-brand-400" />
            Subscription
          </h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-lg font-bold text-white">
                {hasActivePlan && subscription
                  ? getPlanDisplayName(subscription.planId)
                  : dashboardCopy.planName}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {hasActivePlan
                  ? totalEdits === null
                    ? `Unlimited edits · ${renewsInLabel}`
                    : `${usedEdits} of ${totalEdits} edits used · ${renewsInLabel}`
                  : "No Plan Active. Choose a plan to unlock monthly edits."}
              </p>
            </div>
            <a
              href="/#pricing"
              className="shrink-0 text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl transition-colors"
            >
              {dashboardCopy.upgradeCta}
            </a>
          </div>
        </section>

        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
            <Bell className="h-4 w-4 text-brand-400" />
            Notifications
          </h2>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm text-white">Order updates</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Email when your edit moves to review or is delivered.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifications}
              onClick={() => setNotifications(!notifications)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                notifications ? "bg-brand-600" : "bg-surface-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  notifications ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-brand-400" />
            Security
          </h2>
          <p className="text-sm text-gray-500">
            Password reset and two-factor authentication will be available when billing
            is connected.
          </p>
        </section>
      </div>
    </div>
  );
}
