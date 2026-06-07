export const siteConfig = {
  name: "ClipCraft",
  tagline: "Premium managed editing for creators who scale",
  domain: "clipcraft.co.in",
  email: "support@clipcraft.co.in",
  instagram: "@clipcraft.in",
  youtube: "@ClipCraftHQ",
};

export const navbarCopy = {
  signIn: "Sign in",
  dashboard: "Dashboard",
  upload: "Upload",
  cta: "Get in Touch",
};

export const heroContent = {
  badge: "200+ creators · 4.9★ · Viral-ready",
  headline: "Stop Editing. ",
  headlineAccent: "Start Creating.",
  subheadline:
    "Premium managed editing. One dedicated editor. Retention-first hooks. Delivered in 2–4 hours.",
  primaryCta: "Get Started for Free",
  primaryCtaExisting: "Get Started",
  secondaryCta: "See Viral Edits",
  proofLine: "No contracts · Cancel anytime · First edit in 2 hrs",
};

export const heroMicrocopy = {
  dashboardStatus: "Live",
  activeProjects: "In production",
  nextDelivery: "Next drop",
  editorStatus: "Reel #2 ready — hooks locked",
  reviewCta: "Review",
  floatSpeed: "2hr",
  floatSpeedLabel: "Ship daily",
  floatRetention: "+127%",
  floatRetentionLabel: "Retention lift",
  reels: [
    { label: "Reel · Fitness", gradient: "from-rose-600/50 to-orange-500/30", delay: "0s" },
    { label: "Short · Edu", gradient: "from-violet-600/50 to-indigo-500/30", delay: "0.5s" },
    { label: "Podcast clip", gradient: "from-cyan-600/50 to-teal-500/30", delay: "1s" },
  ],
};

export const trustSection = {
  label: "Trusted",
  title: "The edit team behind daily posters",
  description: "Speed. Quality. Consistency. Zero timeline grind.",
};

export const trustMetrics = [
  { value: "240+", label: "Edits shipped" },
  { value: "4.9/5", label: "Creator rated" },
  { value: "24hr", label: "Median delivery" },
  { value: "98%", label: "On-time" },
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

export const portfolioSection = {
  label: "Work",
  title: "Built to hold the scroll",
  description: "Real edits. Hook-first. Platform-native. Performance over polish theater.",
};

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
    title: "Fitness Reels · 1.2M views",
    category: "Reels" as const,
    client: "FitVerse",
    views: "1.2M",
    videoUrl : '/videos/Fitness.mp4',
    gradient: "from-rose-500/40 via-orange-500/30 to-amber-500/20",
    accent: "#fb7185",
  },
  {
    id: "2",
    title: "YouTube · 840K views",
    category: "YouTube" as const,
    client: "EduSpark",
    views: "840K",
    videoUrl : '/videos/Edited1.mp4',
    gradient: "from-violet-500/40 via-purple-500/30 to-indigo-500/20",
    accent: "#a78bfa",
  },
  {
    id: "3",
    title: "Podcast Clips · 320K views",
    category: "Podcast" as const,
    client: "PodFlow",
    views: "320K",
    videoUrl : '/videos/Podcast.mp4',
    gradient: "from-cyan-500/40 via-teal-500/30 to-emerald-500/20",
    accent: "#2dd4bf",
  },
  {
    id: "4",
    title: "Launch Ad · 2.1M views",
    category: "Ads" as const,
    client: "BrandNest",
    views: "2.1M",
    videoUrl : '/videos/LaunchAd.mp4',
    gradient: "from-blue-500/40 via-sky-500/30 to-cyan-500/20",
    accent: "#38bdf8",
  },
  {
    id: "5",
    title: "Coach Shorts · 560K views",
    category: "Reels" as const,
    client: "CoachHQ",
    views: "560K",
    videoUrl : '/videos/CoachShorts.mp4',
    gradient: "from-fuchsia-500/40 via-pink-500/30 to-rose-500/20",
    accent: "#e879f9",
  },
  {
    id: "6",
    title: "Agency Reel · 1.8M views",
    category: "YouTube" as const,
    client: "AgencyOne",
    views: "1.8M",
    videoUrl : '/videos/Agency.mp4',
    gradient: "from-amber-500/40 via-yellow-500/30 to-orange-500/20",
    accent: "#fbbf24",
  },
];

export const whyChooseUsSection = {
  label: "Why us",
  title: "Scale content. Skip the timeline.",
  description: "One subscription. One editor. Viral pacing on repeat.",
  competitorsLabel: "Stop settling for",
};

export const whyChooseUs = [
  {
    title: "Ship in 2–4 hours",
    description: "Pro: 12hr priority. Miss the deadline — next edit free.",
    icon: "zap" as const,
    stat: "2–4hr",
  },
  {
    title: "One editor. Your vibe.",
    description: "No random freelancers. Your style locked from upload one.",
    icon: "user" as const,
    stat: "1:1",
  },
  {
    title: "Hooks that hold",
    description: "Retention pacing. Trend captions. Built for Reels, Shorts, TikTok.",
    icon: "trending" as const,
    stat: "3× hooks",
  },
  {
    title: "Polish until elite",
    description: "Unlimited revisions on Pro+. Your feed only sees the final cut.",
    icon: "repeat" as const,
    stat: "∞",
  },
];

export const competitors = [
  { name: "Fiverr", issue: "New editor every time. Brand never sticks." },
  { name: "Vidchops", issue: "₹24K+/mo. Overkill for most creators." },
  { name: "CapCut nights", issue: "Hours lost. Growth paused." },
  { name: "WhatsApp editors", issue: "No SLA. No style memory. Chaos." },
];

export const howItWorksSection = {
  label: "Process",
  title: "Upload. Edit. Go viral.",
  description: "Three steps. No timeline skills. No hiring.",
  cta: "View pricing",
};

export const processSteps = [
  {
    step: "01",
    title: "Upload",
    description: "Drop clips + references. We handle the rest.",
    icon: "upload" as const,
  },
  {
    step: "02",
    title: "We edit",
    description: "Hook-first cut. Captions. Sound. Your style, every time.",
    icon: "sparkles" as const,
  },
  {
    step: "03",
    title: "Publish",
    description: "Platform-ready files. Post more. Burn out less.",
    icon: "publish" as const,
  },
];

export const pricingSection = {
  label: "Pricing",
  title: "Pay for posts, not problems",
  description: "Scale output. Cancel anytime.",
};

export const pricingMicrocopy = {
  monthly: "Monthly",
  yearly: "Yearly",
  yearlyBadge: "",
  popularBadge: "Most chosen",
};

export const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    originalPrice: 1999,
    price: 1798,
    originalYearlyPrice: 23988,
    yearlyPrice: 19200,
    description: "Start posting consistently.",
    popular: false,
    features: [
      "4 short edits / mo",
      "1 revision each",
      "8 hr delivery",
      "Dedicated editor",
    ],
    cta: "Start Now",
  },
  {
    id: "creator",
    name: "Creator",
    originalPrice: 3799,
    price: 3499,
    originalYearlyPrice: 45588,
    yearlyPrice: 37440,
    description: "Grow the channel. Not the workload.",
    popular: true,
    features: [
      "8 shorts edits / mo",
      "2 revisions",
      "5 hr delivery",
      "Thumbnails included",
      "Priority support",
      "Style memory",
    ],
    cta: "Go Creator",
  },
  {
    id: "pro",
    name: "Pro",
    originalPrice: 6999,
    price: 6498,
    originalYearlyPrice: 83988,
    yearlyPrice: 69300,
    description: "Full-time creator mode.",
    popular: false,
    features: [
      "15 shortsedits",
      "Unlimited revisions",
      "3 hr delivery",
      "12hr priority",
      "Captions + thumbnails",
      "Direct editor chat",
    ],
    cta: "Go Pro",
  },
  {
    id: "business",
    name: "Business",
    originalPrice: 12999,
    price: 12750,
    originalYearlyPrice: 155988,
    yearlyPrice: 129988,
    description: "Agencies & teams at volume.",
    popular: false,
    features: [
      "30 short edits",
      "Senior editor",
      "Top priority",
      "Captions + thumbnails",
      "Direct editor Whatsapp chat",
      "Style memory",
      "Brand guidelines",
    ],
    cta: "Talk to Us",
  },
];

export const testimonialsSection = {
  label: "Proof",
  title: "They quit editing. Growth didn't.",
  description: "Creators, coaches, agencies — same result: more posts, less grind.",
};

export const testimonials = [
  {
    name: "Priya Sharma",
    role: "Fitness · 124K",
    quote:
      "Three hours per reel → zero. Same pacing every time. Watch time up 40% in six weeks.",
    avatar: "PS",
    metric: "+40% retention",
  },
  {
    name: "Rahul Mehta",
    role: "YouTube · 85K subs",
    quote:
      "One editor. Every upload on-brand. Shorts and long-form. Best hire I never made.",
    avatar: "RM",
    metric: "12 vids / mo",
  },
  {
    name: "Ananya Reddy",
    role: "Food · 48K",
    quote:
      "Elite edits. No ghosting. Upload → approve → post. Output 4× in two months.",
    avatar: "AR",
    metric: "4× output",
  },
  {
    name: "Marcus Chen",
    role: "Agency · 12 clients",
    quote:
      "White-label for client reels. Fast revisions. Margins that actually work.",
    avatar: "MC",
    metric: "12 clients",
  },
];

export const founderSection = {
  label: "Founder",
  title: "Built because timelines kill momentum",
  badge: "Founder QA",
};

export const founder = {
  name: "Vishal Dhangar",
  title: "Founder & CEO",
  bio: "I watched talent burn out in timelines — not from lack of ideas. ClipCraft exists so you stay on camera, not in post.",
  credentials: [
    "3+ years post-production",
    "50+ Indian creators edited",
    "Founder signs off on quality",
  ],
  avatar: "VD",
};

export const faqSection = {
  label: "FAQ",
  title: "Quick answers",
  description: "Switch without second-guessing.",
};

export const faqs = [
  {
    question: "What is ClipCraft?",
    answer:
      "Premium managed video editing on subscription. Upload raw footage — get publish-ready Reels, Shorts, and long-form. No freelancer roulette.",
  },
  {
    question: "Why not Fiverr?",
    answer:
      "New editor every job. Inconsistent style. Zero accountability. ClipCraft = one editor, saved brand style, guaranteed speed, one dashboard.",
  },
  {
    question: "How fast?",
    answer:
      "Starter 48hr · Creator 24hr · Pro 12hr · Business same-day. Miss the SLA? Free re-edit.",
  },
  {
    question: "Will it feel like me?",
    answer:
      "Yes. Style Profile stores your pacing, colors, music, hooks. Your editor references it every upload.",
  },
  {
    question: "What formats?",
    answer:
      "Reels, Shorts, TikTok, YouTube, podcasts, ads, courses. Native ratios. Captions + thumbs on higher tiers.",
  },
  {
    question: "Billing?",
    answer:
      "Monthly or annual via Razorpay. Annual = 2 months free. Cancel anytime. No lock-in.",
  },
];

export const finalCta = {
  badge: "12 spots left this month",
  headline: "Stop editing. Start dominating the feed.",
  subheadline: "Reclaim 15+ hours a week. First edit in 48 hours.",
  perks: ["Free onboarding", "Cancel anytime"],
  cta: "Schedule a Free Call",
  placeholder: "you@email.com",
  successTitle: "You're in.",
  successMessage: "We'll match your editor within 24 hours.",
  disclaimer: "No spam · 14-day guarantee on Creator+",
};

export const footerContent = {
  description:
    "Premium managed video editing for creators and businesses. Speed. Consistency. Viral-ready.",
  productHeading: "Product",
  companyHeading: "Company",
  connectHeading: "Connect",
  copyright: "All rights reserved.",
};

export const audienceTags = [
  "Creators",
  "Agencies",
  "Podcasters",
  "Coaches",
  "Brands",
  "YouTubers",
];
