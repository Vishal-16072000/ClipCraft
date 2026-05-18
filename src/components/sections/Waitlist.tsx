import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Waitlist() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    handle: "",
    plan: "creator",
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="waitlist" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

          <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:px-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  Join the First 100 Creators
                </h2>
                <p className="mt-4 text-lg text-white/80 leading-relaxed">
                  Phase 1 launch mein limited slots hain. Early access pe special
                  pricing aur priority onboarding milega. Backend connect hone ke
                  baad aapko directly notify karenge.
                </p>
                <ul className="mt-8 space-y-3">
                  {[
                    "Free onboarding call with your editor",
                    "First edit priority delivery",
                    "Early-bird pricing locked for 6 months",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-white/90">
                      <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-16 w-16 text-white mx-auto mb-4" />
                    <h3 className="font-display text-2xl font-bold text-white">
                      You're on the list! 🎉
                    </h3>
                    <p className="mt-3 text-white/80">
                      Hum jald hi {form.email} pe reach out karenge. Ab content
                      pe focus karo — editing hum sambhal lenge.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-1.5">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1.5">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                        placeholder="you@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="handle" className="block text-sm font-medium text-white/90 mb-1.5">
                        Instagram / YouTube Handle
                      </label>
                      <input
                        id="handle"
                        type="text"
                        value={form.handle}
                        onChange={(e) => setForm({ ...form, handle: e.target.value })}
                        className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                        placeholder="@yourhandle"
                      />
                    </div>
                    <div>
                      <label htmlFor="plan" className="block text-sm font-medium text-white/90 mb-1.5">
                        Interested Plan
                      </label>
                      <select
                        id="plan"
                        value={form.plan}
                        onChange={(e) => setForm({ ...form, plan: e.target.value })}
                        className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                      >
                        <option value="starter" className="bg-surface-800">Starter — ₹999/mo</option>
                        <option value="creator" className="bg-surface-800">Creator — ₹1,999/mo</option>
                        <option value="pro" className="bg-surface-800">Pro — ₹3,499/mo</option>
                        <option value="business" className="bg-surface-800">Business — ₹6,999/mo</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-white text-brand-700 font-bold py-4 rounded-xl hover:bg-white/90 transition-colors mt-2"
                    >
                      Join Waitlist
                      <ArrowRight className="h-5 w-5" />
                    </button>
                    <p className="text-xs text-white/60 text-center">
                      No spam. Unsubscribe anytime. Data stored locally for now — backend integration coming soon.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
