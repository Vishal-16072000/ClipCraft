import { Link } from "react-router-dom";
import { Mail, Play, Share2, Video } from "lucide-react";
import { siteConfig } from "../../data/content";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
                <Play className="h-4 w-4 fill-white text-white ml-0.5" />
              </div>
              <span className="font-display text-lg font-bold text-white">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              {siteConfig.tagline}. Every creator deserves a dedicated editor —
              affordable, fast, and reliable.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">
              Product
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="/#how-it-works" className="hover:text-white transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/#pricing" className="hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/upload" className="hover:text-white transition-colors">
                  Upload Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="/#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#waitlist" className="hover:text-white transition-colors">
                  Join Waitlist
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">
              Connect
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-brand-400" />
                <span>{siteConfig.instagram}</span>
              </li>
              <li className="flex items-center gap-2">
                <Video className="h-4 w-4 text-brand-400" />
                <span>{siteConfig.youtube}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-400" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Made with ❤️ in India · {siteConfig.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
