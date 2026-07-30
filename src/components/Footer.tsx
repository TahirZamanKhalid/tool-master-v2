import { Link } from "react-router-dom";
import { Mail, Shield, Zap, ArrowRight, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  const year = new Date().getFullYear();

  const toolLinks = [
    { label: "Background Remover", href: "/tools/background-remover" },
    { label: "PDF Merger", href: "/tools/pdf-merger" },
    { label: "Image Compressor", href: "/tools/advanced-image-compressor" },
    { label: "QR Code Generator", href: "/tools/qr-code-generator" },
    { label: "Password Generator", href: "/tools/password-generator" },
    { label: "JSON Formatter", href: "/tools/json-formatter" },
  ];

  const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "All Tools", href: "/tools" },
    { label: "Sitemap", href: "/sitemap.xml", external: true },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "/cookie-policy" },
    { label: "DMCA", href: "/dmca" },
    { label: "Disclaimer", href: "/disclaimer" },
  ];

  return (
    <footer className="bg-card border-t border-border/50 mt-16">
      <div className="container max-w-7xl mx-auto px-4 pt-14 pb-8">

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-sm shadow-md">
                TM
              </div>
              <div className="leading-none">
                <span className="font-black text-lg text-foreground">ToolMaster<span className="text-primary">Pro</span></span>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">160+ Free Online Tools</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your all-in-one platform for free browser-based tools. No registration, no fees, no uploads to servers — just instant results.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/toolmasterpro"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all duration-200"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/toolmasterpro"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all duration-200"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@toolmaster.cloud"
                aria-label="Email"
                className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all duration-200"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>

            <div className="flex gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Privacy First</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span>Lightning Fast</span>
              </div>
            </div>
          </div>

          {/* Popular Tools */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Popular Tools</h4>
            <ul className="space-y-2.5">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/tools" className="text-sm text-primary font-semibold hover:underline">
                  View All 160+ Tools →
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} ToolMasterPro. All rights reserved. Made with ❤️ for the web.
          </p>
          <p className="text-xs text-muted-foreground">
            All tools are free, browser-based and require no account.
          </p>
        </div>

      </div>
    </footer>
  );
};
