import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Clock, Zap } from "lucide-react";
import { finalCta } from "../../data/content";

type LeadForm = {
  name: string;
  email: string;
  phone: string;
  contentType: string;
  monthlyVideos: string;
  message: string;
};

const initialForm: LeadForm = {
  name: "",
  email: "",
  phone: "",
  contentType: "",
  monthlyVideos: "",
  message: "",
};

const fieldClass =
  "w-full min-w-0 rounded-2xl border border-white/25 bg-white/10 px-4 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 sm:px-5 sm:py-4";

export function FinalCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "Could not submit the form. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(field: keyof LeadForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setSubmitted(false);
    setError(null);
  }

  if (submitted) {
    return (
      <section id="cta" className="section-padding">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-600 to-accent-600" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />

            <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20 lg:px-20 lg:py-24">
              <div className="mx-auto max-w-xl rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl">
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-white" />
                <p className="font-display text-2xl font-bold text-white">
                  {finalCta.successTitle}
                </p>
                <p className="mt-3 text-sm text-white/80">
                  We&apos;ll reach out at {form.email}. {finalCta.successMessage}
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-brand-700 transition-colors hover:bg-white/95"
                >
                  Submit another request
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="cta" className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-600 to-accent-600" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div className="relative px-4 py-14 sm:px-12 sm:py-20 lg:px-20 lg:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm text-white/90 mb-6">
                <Clock className="h-4 w-4" />
                <span>{finalCta.badge}</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                {finalCta.headline}
              </h2>
              <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
                {finalCta.subheadline}
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/70">
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  {finalCta.perks[0]}
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {finalCta.perks[1]}
                </span>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mx-auto mt-10 grid w-full min-w-0 max-w-2xl gap-3 rounded-3xl border border-white/15 bg-black/10 p-3 text-left backdrop-blur sm:grid-cols-2 sm:p-5"
              >
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Your name"
                  className={fieldClass}
                />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder={finalCta.placeholder}
                  className={fieldClass}
                />
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="WhatsApp / phone"
                  className={fieldClass}
                />
                <select
                  required
                  value={form.contentType}
                  onChange={(e) => updateField("contentType", e.target.value)}
                  className={fieldClass}
                >
                  <option value="" className="bg-surface-900">
                    Content type
                  </option>
                  <option value="Reels / Shorts" className="bg-surface-900">
                    Reels / Shorts
                  </option>
                  <option value="YouTube videos" className="bg-surface-900">
                    YouTube videos
                  </option>
                  <option value="Podcast clips" className="bg-surface-900">
                    Podcast clips
                  </option>
                  <option value="Ads / brand videos" className="bg-surface-900">
                    Ads / brand videos
                  </option>
                </select>
                <select
                  required
                  value={form.monthlyVideos}
                  onChange={(e) => updateField("monthlyVideos", e.target.value)}
                  className={`${fieldClass} sm:col-span-2`}
                >
                  <option value="" className="bg-surface-900">
                    How many videos per month?
                  </option>
                  <option value="4-8 videos/month" className="bg-surface-900">
                    4-8 videos/month
                  </option>
                  <option value="9-15 videos/month" className="bg-surface-900">
                    9-15 videos/month
                  </option>
                  <option value="16+ videos/month" className="bg-surface-900">
                    16+ videos/month
                  </option>
                </select>
                <textarea
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  placeholder="Tell us what you create and what you need edited"
                  rows={4}
                  className={`${fieldClass} resize-none sm:col-span-2`}
                />
                {error && (
                  <p className="rounded-2xl border border-red-300/30 bg-red-500/20 px-4 py-3 text-sm text-white sm:col-span-2">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-brand-700 transition-colors hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                >
                  {submitting ? "Submitting..." : finalCta.cta}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>

              <p className="mt-6 text-xs text-white/50">{finalCta.disclaimer}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
