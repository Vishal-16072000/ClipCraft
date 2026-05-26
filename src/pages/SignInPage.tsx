import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { useAuth } from "../contexts/AuthContext";

type AuthMode = "signin" | "signup" | "forgot";

const inputClassName =
  "w-full rounded-xl bg-surface-700/50 border border-white/10 px-4 py-3 pl-11 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50";
const passwordInputClassName = `${inputClassName} pr-12`;

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const {
    user,
    loading: authLoading,
    configured,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    role,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(role === "editor" ? "/editor" : redirectTo, { replace: true });
    }
  }, [authLoading, role, user, navigate, redirectTo]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (mode === "forgot") {
        const { error: err } = await resetPassword(email);
        if (err) {
          setError(err);
        } else {
          setSuccess("Password reset link sent. Check your inbox.");
        }
        return;
      }

      if (mode === "signup") {
        if (password.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
        }
        const { error: err } = await signUpWithEmail(email, password);
        if (err) {
          setError(err);
        } else {
          setSuccess(
            "Account created. Check your email to confirm, then sign in.",
          );
          setMode("signin");
          setPassword("");
        }
        return;
      }

      const { error: err, role: signedInRole } = await signInWithEmail(email, password);
      if (err) {
        setError(err);
      } else {
        navigate(signedInRole === "editor" ? "/editor" : redirectTo, { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  }

  const title =
    mode === "signin"
      ? "Welcome back"
      : mode === "signup"
        ? "Create your account"
        : "Reset password";

  const subtitle =
    mode === "signin"
      ? "Sign in to access your upload portal and orders."
      : mode === "signup"
        ? "Start uploading raw footage to your dedicated editor."
        : "We'll email you a link to set a new password.";

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-20 min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-brand-400 animate-spin" />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 min-h-screen mesh-gradient">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="text-center mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              {title}
            </h1>
            <p className="mt-2 text-gray-400">{subtitle}</p>
          </div>

          {!configured && (
            <div className="glass rounded-2xl p-4 mb-6 flex gap-3">
              <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-400">
                <span className="text-white font-medium">Setup required:</span>{" "}
                Add{" "}
                <code className="text-brand-300">VITE_SUPABASE_URL</code> and{" "}
                <code className="text-brand-300">VITE_SUPABASE_PUBLISHABLE_KEY</code>{" "}
                in your environment variables. For local development use a{" "}
                <code className="text-brand-300">.env</code> file; for deployment add
                them in your hosting provider and redeploy.
              </p>
            </div>
          )}

          <div className="glass rounded-3xl p-6 sm:p-8 glow-brand">
            {mode !== "forgot" && (
              <div className="flex rounded-xl bg-surface-800/80 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                    mode === "signin"
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                    mode === "signup"
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Sign up
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 flex gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 flex gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClassName}
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        mode === "signup" ? "new-password" : "current-password"
                      }
                      required
                      minLength={mode === "signup" ? 8 : undefined}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        mode === "signup" ? "Min. 8 characters" : "Password"
                      }
                      className={passwordInputClassName}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {mode === "signin" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !configured}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-brand-600/25"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signin" && "Sign in"}
                {mode === "signup" && "Create account"}
                {mode === "forgot" && "Send reset link"}
              </button>
            </form>

            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="mt-4 w-full text-sm text-gray-400 hover:text-white transition-colors"
              >
                Back to sign in
              </button>
            )}

            {mode !== "forgot" && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-surface-800/50 px-3 text-gray-500">
                      or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled
                  className="w-full flex cursor-not-allowed items-center justify-center gap-3 glass rounded-2xl py-3.5 text-white/50 font-medium opacity-50 transition-colors"
                  title="Google sign in will be available soon"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google · coming soon
                </button>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
