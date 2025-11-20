import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t mt-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
      </div>
      <div className="container py-12 px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="gradient-primary h-10 w-10 rounded-xl flex items-center justify-center shadow-card group-hover:shadow-card-hover transition-smooth group-hover:scale-110 group-hover:rotate-6">
                <span className="text-white font-black text-lg tracking-tight">TM</span>
              </div>
              <h3 className="text-lg font-bold text-gradient">
                ToolMaster Pro
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your all-in-one platform for 100+ free online tools. Making your daily tasks easier and more efficient.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-bounce hover:scale-125 p-2 rounded-lg hover:shadow-card">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-bounce hover:scale-125 p-2 rounded-lg hover:shadow-card">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-bounce hover:scale-125 p-2 rounded-lg hover:shadow-card">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:contact@toolmasterpro.com" className="text-muted-foreground hover:text-primary transition-bounce hover:scale-125 p-2 rounded-lg hover:shadow-card">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Tools Section */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h4 className="font-bold mb-4 text-gradient">Popular Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/tools/background-remover" className="text-muted-foreground hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  → Background Remover
                </Link>
              </li>
              <li>
                <Link to="/tools/qr-code-generator" className="text-muted-foreground hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  → QR Code Generator
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-merger" className="text-muted-foreground hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  → PDF Merger
                </Link>
              </li>
              <li>
                <Link to="/tools/image-compressor" className="text-muted-foreground hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  → Image Compressor
                </Link>
              </li>
              <li>
                <Link to="/tools/word-counter" className="text-muted-foreground hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  → Word Counter
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h4 className="font-bold mb-4 text-gradient">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  → About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  → Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  → Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h4 className="font-bold mb-4 text-gradient">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  → Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  → Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-muted-foreground hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  → Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-muted-foreground hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  → Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/dmca" className="text-muted-foreground hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  → DMCA Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gradient mt-8 pt-8 text-center text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="font-semibold">&copy; {currentYear} ToolMaster Pro. All rights reserved.</p>
          <p className="mt-2 font-medium">
            Made with <span className="text-red-500 animate-pulse-slow">❤️</span> to make your life easier. <span className="text-gradient font-bold">100% free tools</span>, no signup required.
          </p>
        </div>
      </div>
    </footer>
  );
};