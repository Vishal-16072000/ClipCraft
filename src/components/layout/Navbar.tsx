import { Link } from "react-router-dom";
import { Play, Menu, X } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "../../data/content";

const navLinks = [
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mt-4 flex items-center justify-between rounded-2xl glass px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-600/30 group-hover:shadow-brand-500/50 transition-shadow">
              <Play className="h-4 w-4 fill-white text-white ml-0.5" />
            </div>
            <span className="font-display text-lg font-bold text-white">
              {siteConfig.name}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/upload"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              Upload
            </Link>
            <a
              href="#waitlist"
              className="text-sm font-semibold bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-600/25 hover:shadow-brand-500/40"
            >
              Get Started
            </a>
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {open && (
          <div className="md:hidden mt-2 rounded-2xl glass p-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/upload"
              className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              onClick={() => setOpen(false)}
            >
              Upload
            </Link>
            <a
              href="#waitlist"
              className="block mt-2 text-center font-semibold bg-brand-600 text-white px-4 py-3 rounded-xl"
              onClick={() => setOpen(false)}
            >
              Get Started
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
