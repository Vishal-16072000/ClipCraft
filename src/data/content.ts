export const siteConfig = {
  name: "ClipCraft",
  tagline: "India's Premier Managed Video Editing Platform",
  domain: "clipcraft.in",
  email: "contact@clipcraft.in",
  instagram: "@clipcraft.in",
  youtube: "@ClipCraftHQ",
};

export const stats = [
  { value: "80L+", label: "Active Indian Creators" },
  { value: "68%", label: "Struggle with Editing" },
  { value: "48hr", label: "Turnaround Guarantee" },
  { value: "₹999", label: "Starting Price / mo" },
];

export const howItWorks = [
  {
    step: "01",
    title: "Shoot",
    description:
      "Create your raw footage — reels, shorts, or long-form. Focus on content, not editing.",
    icon: "camera" as const,
  },
  {
    step: "02",
    title: "Upload",
    description:
      "Upload footage, reference videos, and style notes. Your dedicated editor learns your brand.",
    icon: "upload" as const,
  },
  {
    step: "03",
    title: "Publish",
    description:
      "Receive polished edits in 48 hours. Download or publish directly to Instagram & YouTube.",
    icon: "publish" as const,
  },
];

export const features = [
  {
    title: "Dedicated Editor",
    description:
      "Same editor every time — no more hunting freelancers on Fiverr or WhatsApp chaos.",
    icon: "user" as const,
  },
  {
    title: "Style Memory",
    description:
      "Your brand colors, pace, music genre, and preferences are saved. Consistent quality, every video.",
    icon: "palette" as const,
  },
  {
    title: "48-Hour Guarantee",
    description:
      "Professional edits delivered within 48 hours — or get a free re-edit. No excuses.",
    icon: "clock" as const,
  },
  {
    title: "Thumbnail + Captions",
    description:
      "Pro thumbnails and scroll-stopping captions included on higher plans. Full-stack service.",
    icon: "sparkles" as const,
  },
  {
    title: "India-First Pricing",
    description:
      "Plans in INR from ₹999/month. No dollar confusion. Built for Indian creators.",
    icon: "rupee" as const,
  },
  {
    title: "Auto-Publish",
    description:
      "Download your edit or publish directly to Instagram & YouTube from one dashboard.",
    icon: "share" as const,
  },
];

export const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    price: 999,
    yearlyPrice: 9999,
    description: "Perfect for nano creators & beginners getting started.",
    popular: false,
    features: [
      "4 short edits (Reels/Shorts)",
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
    description: "For micro creators posting consistently every week.",
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
    description: "Full-time creators & personal brands who need speed.",
    popular: false,
    features: [
      "15 edits + 2 long-form (up to 15 min)",
      "Unlimited revisions",
      "Priority 12-hour turnaround",
      "Thumbnail + caption writing",
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
    description: "Agencies, businesses & top creators who need it all.",
    popular: false,
    features: [
      "Unlimited edits",
      "Dedicated senior editor",
      "Same-day turnaround",
      "All add-ons included",
      "Direct WhatsApp support",
      "Custom brand guidelines",
    ],
    cta: "Contact Sales",
  },
];

export const testimonials = [
  {
    name: "Priya Sharma",
    role: "Fitness Creator · 24K followers",
    quote:
      "Pehle ek reel edit karne mein 3 ghante lagte the. Ab main sirf shoot karti hoon — ClipCraft wapas 24 hours mein perfect edit bhej deta hai.",
    avatar: "PS",
  },
  {
    name: "Rahul Mehta",
    role: "YouTube Educator · 85K subs",
    quote:
      "Same editor har baar mera style samajhta hai. Long-form + shorts dono handle karte hain. Best investment for any serious creator.",
    avatar: "RM",
  },
  {
    name: "Ananya Reddy",
    role: "Food Blogger · 12K followers",
    quote:
      "₹999 mein 4 edits — yeh Fiverr se sasta aur reliable hai. No negotiations, no ghosting. Bas upload karo aur publish karo.",
    avatar: "AR",
  },
];

export const faqs = [
  {
    question: "ClipCraft kya hai exactly?",
    answer:
      "ClipCraft ek managed video editing subscription service hai. Aap raw footage upload karte ho, aur humara dedicated editor professionally edited video wapas deta hai — bina freelancer dhundhe, bina negotiations ke.",
  },
  {
    question: "Fiverr ya freelancer se kya fark hai?",
    answer:
      "Fiverr pe har baar naya editor, inconsistent quality, aur trust issues. ClipCraft pe same dedicated editor, style memory, guaranteed turnaround, aur ek platform pe sab kuch manage hota hai.",
  },
  {
    question: "Kitne time mein edit mil jayega?",
    answer:
      "Starter plan pe 48 hours, Creator plan pe 24 hours, aur Pro/Business plans pe 12 hours ya same-day turnaround. Guarantee miss ho to free re-edit.",
  },
  {
    question: "Kya main apna style specify kar sakta hoon?",
    answer:
      "Haan! Style Profile mein aap colors, music genre, pace, transitions, aur brand guidelines save kar sakte ho. Editor aapka style yaad rakhta hai.",
  },
  {
    question: "Payment kaise hoga?",
    answer:
      "Razorpay se — UPI, cards, aur auto-renewal subscription. Monthly ya annual plans available. Annual pe 2 months free.",
  },
  {
    question: "Kya abhi sign up kar sakte hain?",
    answer:
      "Haan! Phase 1 launch mein hum limited slots le rahe hain. Waitlist join karo ya directly plan choose karo — pehle 100 creators ko special early-bird pricing milegi.",
  },
];

export const competitors = [
  { name: "Fiverr", issue: "New editor every time, inconsistent quality" },
  { name: "Vidchops", issue: "₹24K+/mo — too expensive for India" },
  { name: "CapCut DIY", issue: "Still needs your time & skill" },
  { name: "Local Freelancers", issue: "No accountability, WhatsApp chaos" },
];
