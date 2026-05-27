import { Link } from "react-router-dom";
import { Heart, Mail, Play, Share2, Video } from "lucide-react";
import { siteConfig, footerContent } from "../../data/content";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface-900">
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
            <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
              {footerContent.description}
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">
              {footerContent.productHeading}
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="/#portfolio" className="hover:text-white transition-colors">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="/#process" className="hover:text-white transition-colors">
                  Process
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
              {footerContent.companyHeading}
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="/#about" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#cta" className="hover:text-white transition-colors">
                  Get Started
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">
              {footerContent.connectHeading}
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-brand-400 shrink-0" />
                <span>{siteConfig.instagram}</span>
              </li>
              <li className="flex items-center gap-2">
                <Video className="h-4 w-4 text-brand-400 shrink-0" />
                <span>{siteConfig.youtube}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-400 shrink-0" />
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
            © {new Date().getFullYear()} {siteConfig.name}. {footerContent.copyright}
          </p>
          <div className="flex flex-col items-center gap-2 text-sm text-gray-500 sm:items-end">
            <p>{siteConfig.domain}</p>
            <p className="inline-flex items-center gap-1.5">
              Made with <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
