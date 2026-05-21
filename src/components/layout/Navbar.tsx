import { Link } from "react-router-dom";
import { Play, Menu, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { siteConfig, navbarCopy } from "../../data/content";
import { useAuth } from "../../contexts/AuthContext";

const navLinks = [
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Process", href: "/#process" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const displayName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Account";

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          className={`mt-3 sm:mt-4 flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6 transition-all duration-300 ${
            scrolled
              ? "glass-strong shadow-lg shadow-black/20 border border-white/10"
              : "bg-transparent border border-transparent"
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-600/30 group-hover:shadow-brand-500/50 transition-shadow">
              <Play className="h-4 w-4 fill-white text-white ml-0.5" />
            </div>
            <span className="font-display text-lg font-bold text-white tracking-tight">
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
            {!loading && !user && (
              <Link
                to="/signin"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2"
              >
                {navbarCopy.signIn}
              </Link>
            )}
            {!loading && user && (
              <span className="text-sm text-gray-400 max-w-[140px] truncate">
                {displayName}
              </span>
            )}
            <Link
              to="/upload"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              {navbarCopy.upload}
            </Link>
            {!loading && user && (
              <button
                type="button"
                onClick={() => signOut()}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
            <a
              href="#cta"
              className="text-sm font-bold bg-white text-surface-900 hover:bg-gray-100 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-white/10"
            >
              {navbarCopy.cta}
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
          <div className="md:hidden mt-2 rounded-2xl glass-strong p-4 space-y-1 border border-white/10">
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
            {!loading && !user && (
              <Link
                to="/signin"
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                onClick={() => setOpen(false)}
              >
                {navbarCopy.signIn}
              </Link>
            )}
            {!loading && user && (
              <div className="px-4 py-3 text-sm text-gray-400 flex items-center justify-between">
                <span className="truncate">{displayName}</span>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
            <Link
              to="/upload"
              className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              onClick={() => setOpen(false)}
            >
              {navbarCopy.upload}
            </Link>
            <a
              href="#cta"
              className="block mt-2 text-center font-bold bg-white text-surface-900 px-4 py-3 rounded-xl"
              onClick={() => setOpen(false)}
            >
              {navbarCopy.cta}
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
