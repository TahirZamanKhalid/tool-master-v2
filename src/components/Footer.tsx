import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t mt-20">
      <div className="container py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="gradient-primary h-10 w-10 rounded-xl flex items-center justify-center shadow-card">
                <span className="text-white font-black text-lg tracking-tight">TM</span>
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ToolMaster Pro
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your all-in-one platform for 100+ free online tools. Making your daily tasks easier and more efficient.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:contact@toolmasterpro.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Tools Section */}
          <div>
            <h4 className="font-semibold mb-4">Popular Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/tools/background-remover" className="text-muted-foreground hover:text-primary transition-colors">
                  Background Remover
                </Link>
              </li>
              <li>
                <Link to="/tools/qr-code-generator" className="text-muted-foreground hover:text-primary transition-colors">
                  QR Code Generator
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-merger" className="text-muted-foreground hover:text-primary transition-colors">
                  PDF Merger
                </Link>
              </li>
              <li>
                <Link to="/tools/image-compressor" className="text-muted-foreground hover:text-primary transition-colors">
                  Image Compressor
                </Link>
              </li>
              <li>
                <Link to="/tools/word-counter" className="text-muted-foreground hover:text-primary transition-colors">
                  Word Counter
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-muted-foreground hover:text-primary transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/dmca" className="text-muted-foreground hover:text-primary transition-colors">
                  DMCA Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} ToolMaster Pro. All rights reserved.</p>
          <p className="mt-2">
            Made with ❤️ to make your life easier. 100% free tools, no signup required.
          </p>
        </div>
      </div>
    </footer>
  );
};