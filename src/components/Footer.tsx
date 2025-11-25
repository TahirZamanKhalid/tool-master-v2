import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Mail, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-white/5 relative overflow-hidden mt-20">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container relative z-10 pt-16 pb-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                TM
              </div>
              <span className="font-bold text-xl tracking-tight">ToolMaster Pro</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your all-in-one platform for 100+ free online tools. Professional web-based utilities for developers, designers, and content creators.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-foreground">Product</h4>
            <ul className="space-y-3">
              {['All Tools', 'Popular', 'New Arrivals', 'Categories'].map((item) => (
                <li key={item}>
                  <Link to="/tools" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-foreground">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Blog', 'Contact', 'Careers'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <h4 className="font-bold text-foreground">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest tools and updates.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email"
                className="bg-background/50 border-white/10 focus:border-primary/50"
              />
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Subscribe
              </Button>
            </div>
            <div className="flex gap-6 pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-4 w-4 text-accent" />
                <span>Lightning Fast</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} ToolMaster Pro. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};