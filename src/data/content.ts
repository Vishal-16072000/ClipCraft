export const siteConfig = {
  name: "ClipCraft",
  tagline: "Managed video editing for creators who ship daily",
  domain: "clipcraft.in",
  email: "contact@clipcraft.in",
  instagram: "@clipcraft.in",
  youtube: "@ClipCraftHQ",
};

export const heroContent = {
  badge: "Trusted by 200+ creators & agencies",
  headline: "Publish-ready edits.",
  headlineAccent: "Without touching a timeline.",
  subheadline:
    "Your dedicated editor turns raw footage into scroll-stopping reels, shorts, and long-form — delivered in 24–48 hours with viral pacing, brand consistency, and unlimited polish.",
  primaryCta: "Start Free Trial",
  secondaryCta: "See Our Work",
  proofLine: "No contracts · Cancel anytime · First edit in 48hrs",
};

export const trustMetrics = [
  { value: "2,400+", label: "Videos delivered" },
  { value: "4.9/5", label: "Creator satisfaction" },
  { value: "24hr", label: "Avg. turnaround" },
  { value: "98%", label: "On-time delivery" },
];

export const clientLogos = [
  "CreatorLab",
  "PodFlow",
  "FitVerse",
  "EduSpark",
  "BrandNest",
  "CoachHQ",
  "AgencyOne",
  "ViralMint",
];

export const portfolioCategories = [
  "All",
  "Reels",
  "YouTube",
  "Podcast",
  "Ads",
] as const;

export type PortfolioCategory = (typeof portfolioCategories)[number];

export const portfolioItems = [
  {
    id: "1",
    title: "Fitness Reel Series",
    category: "Reels" as const,
    client: "FitVerse",
    views: "1.2M",
    gradient: "from-rose-500/40 via-orange-500/30 to-amber-500/20",
    accent: "#fb7185",
  },
  {
    id: "2",
    title: "YouTube Explainer",
    category: "YouTube" as const,
    client: "EduSpark",
    views: "840K",
    gradient: "from-violet-500/40 via-purple-500/30 to-indigo-500/20",
    accent: "#a78bfa",
  },
  {
    id: "3",
    title: "Podcast Highlights",
    category: "Podcast" as const,
    client: "PodFlow",
    views: "320K",
    gradient: "from-cyan-500/40 via-teal-500/30 to-emerald-500/20",
    accent: "#2dd4bf",
  },
  {
    id: "4",
    title: "Product Launch Ad",
    category: "Ads" as const,
    client: "BrandNest",
    views: "2.1M",
    gradient: "from-blue-500/40 via-sky-500/30 to-cyan-500/20",
    accent: "#38bdf8",
  },
  {
    id: "5",
    title: "Coaching Shorts",
    category: "Reels" as const,
    client: "CoachHQ",
    views: "560K",
    gradient: "from-fuchsia-500/40 via-pink-500/30 to-rose-500/20",
    accent: "#e879f9",
  },
  {
    id: "6",
    title: "Agency Case Study",
    category: "YouTube" as const,
    client: "AgencyOne",
    views: "1.8M",
    gradient: "from-amber-500/40 via-yellow-500/30 to-orange-500/20",
    accent: "#fbbf24",
  },
];

export const whyChooseUs = [
  {
    title: "Lightning delivery",
    description:
      "24–48 hour turnaround on every edit. Pro plan gets 12-hour priority. Miss the deadline — your next edit is free.",
    icon: "zap" as const,
    stat: "24–48hr",
  },
  {
    title: "Dedicated editor",
    description:
      "One editor learns your brand, pacing, and hooks. No Fiverr roulette. No briefing from scratch every upload.",
    icon: "user" as const,
    stat: "1:1 match",
  },
  {
    title: "Viral-first editing",
    description:
      "Hook-first cuts, retention pacing, trend-aware captions, and platform-native formats built to stop the scroll.",
    icon: "trending" as const,
    stat: "3× hooks",
  },
  {
    title: "Unlimited revisions",
    description:
      "Pro and Business plans include unlimited polish until it's perfect. Your audience sees only the final cut.",
    icon: "repeat" as const,
    stat: "∞ edits",
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Upload footage",
    description:
      "Drop raw clips, references, and brand notes in your dashboard. We handle codecs, organization, and brief alignment.",
    icon: "upload" as const,
  },
  {
    step: "02",
    title: "We edit",
    description:
      "Your dedicated editor cuts, grades, captions, and sound-designs — with style memory so every video feels unmistakably you.",
    icon: "sparkles" as const,
  },
  {
    step: "03",
    title: "You publish",
    description:
      "Download platform-ready files or publish straight to Instagram & YouTube. Ship more content without burning out.",
    icon: "publish" as const,
  },
];

export const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    price: 999,
    yearlyPrice: 9999,
    description: "For creators testing consistent posting.",
    popular: false,
    features: [
      "4 short edits / month",
      "1 revision per edit",
      "48-hour turnaround",
      "Dedicated editor",
      "Style profile setup",
    ],
    cta: "Start Creating",
  },
  {
    id: "creator",
    name: "Creator",
    price: 1999,
    yearlyPrice: 19999,
    description: "For weekly posters scaling their channel.",
    popular: true,
    features: [
      "8 edits (short + long mix)",
      "2 revisions per edit",
      "24-hour turnaround",
      "Thumbnail included",
      "Priority support",
      "Style memory enabled",
    ],
    cta: "Go Creator",
  },
  {
    id: "pro",
    name: "Pro",
    price: 3499,
    yearlyPrice: 34999,
    description: "For full-time creators & personal brands.",
    popular: false,
    features: [
      "15 edits + 2 long-form (15 min)",
      "Unlimited revisions",
      "12-hour priority turnaround",
      "Thumbnail + captions",
      "Direct editor chat",
      "Auto-publish (coming soon)",
    ],
    cta: "Go Pro",
  },
  {
    id: "business",
    name: "Business",
    price: 6999,
    yearlyPrice: null,
    description: "For agencies & teams shipping at volume.",
    popular: false,
    features: [
      "Unlimited edits",
      "Senior dedicated editor",
      "Same-day turnaround",
      "All add-ons included",
      "WhatsApp priority line",
      "Custom brand guidelines",
    ],
    cta: "Talk to Sales",
  },
];

export const testimonials = [
  {
    name: "Priya Sharma",
    role: "Fitness Creator · 124K followers",
    quote:
      "I went from 3 hours per reel to zero. ClipCraft nails my pacing every time — my watch time jumped 40% in six weeks.",
    avatar: "PS",
    metric: "+40% watch time",
  },
  {
    name: "Rahul Mehta",
    role: "YouTube Educator · 85K subs",
    quote:
      "Same editor, same quality, every upload. Long-form and Shorts both feel on-brand. It's the best ops hire I never had to make.",
    avatar: "RM",
    metric: "12 videos / mo",
  },
  {
    name: "Ananya Reddy",
    role: "Food Blogger · 48K followers",
    quote:
      "Agency-level edits at a fraction of the cost. No ghosting, no negotiations — just upload and publish. Game changer.",
    avatar: "AR",
    metric: "4× output",
  },
  {
    name: "Marcus Chen",
    role: "Agency Founder · 12 clients",
    quote:
      "We white-label ClipCraft for client reels. Turnaround is reliable, revisions are fast, and our margins actually work.",
    avatar: "MC",
    metric: "12 clients",
  },
];

export const founder = {
  name: "Arjun Kapoor",
  title: "Founder & CEO",
  bio: "Former video lead at a top creator agency. Built ClipCraft after watching talented creators burn out on timelines instead of content. Every edit ships with the same bar I'd demand for my own channel.",
  credentials: [
    "8+ years in post-production",
    "Edited for 50+ top Indian creators",
    "Ex-agency lead, now founder-led QA",
  ],
  avatar: "AK",
};

export const faqs = [
  {
    question: "What exactly is ClipCraft?",
    answer:
      "ClipCraft is a managed video editing subscription. You upload raw footage; a dedicated editor returns publish-ready videos — no freelancer hunting, no timeline wrestling, no quality roulette.",
  },
  {
    question: "How is this different from Fiverr or Upwork?",
    answer:
      "Marketplaces give you a new editor every time, inconsistent style, and zero accountability. ClipCraft gives you one dedicated editor, saved brand preferences, guaranteed turnaround, and one dashboard for everything.",
  },
  {
    question: "How fast will I get my edits?",
    answer:
      "Starter: 48 hours. Creator: 24 hours. Pro: 12-hour priority. Business: same-day. If we miss your guarantee, you get a free re-edit — no excuses.",
  },
  {
    question: "Can I specify my editing style?",
    answer:
      "Yes. Your Style Profile stores colors, pacing, music taste, transitions, and brand guidelines. Your editor references it on every project so output stays consistent.",
  },
  {
    question: "What formats do you support?",
    answer:
      "Reels, Shorts, TikTok, YouTube long-form, podcast clips, ad creatives, and course content. We deliver in platform-native aspect ratios with captions and thumbnails on higher plans.",
  },
  {
    question: "How does billing work?",
    answer:
      "Monthly or annual subscriptions via Razorpay — UPI, cards, and auto-renewal. Annual plans include 2 months free. Cancel anytime with no lock-in.",
  },
];

export const audienceTags = [
  "YouTubers",
  "Podcasters",
  "Coaches",
  "Agencies",
  "Personal brands",
  "Content creators",
];

export const competitors = [
  { name: "Fiverr", issue: "New editor every time, inconsistent quality" },
  { name: "Vidchops", issue: "₹24K+/mo — overkill for most creators" },
  { name: "CapCut DIY", issue: "Still costs hours you should spend creating" },
  { name: "Local freelancers", issue: "No SLA, no style memory, WhatsApp chaos" },
];
