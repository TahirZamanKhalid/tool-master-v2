import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Target, Users, Zap, Heart, Shield, Globe, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { AdRow } from "@/components/AdRow";

const About = () => {
  const values = [
    { icon: Target, title: "Our Vision", text: "To be the world's most trusted free online tools platform, empowering millions every day." },
    { icon: Users, title: "Our Community", text: "Serving thousands of users daily — students, developers, designers, and businesses worldwide." },
    { icon: Zap, title: "Our Technology", text: "Built with modern web tech for blazing-fast performance, security, and full privacy protection." },
    { icon: Heart, title: "Our Commitment", text: "Free forever. We never sell your data. We respect your privacy and your time." },
  ];

  const benefits = [
    { icon: Shield, title: "Privacy First", text: "Most tools run entirely in your browser. Your files never touch our servers." },
    { icon: Zap, title: "Instant Results", text: "No waiting, no signup. Open the page, use the tool, get your result in seconds." },
    { icon: Globe, title: "Always Available", text: "Works on any device, any browser, anywhere — desktop, tablet, or mobile." },
    { icon: CheckCircle, title: "Always Free", text: "150+ tools, all free, no premium upsells, no credit card, no hidden costs." },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="About ToolMaster Pro — Free Online Tools Platform | Privacy-First"
        description="Learn about ToolMaster Pro: 150+ free professional online tools. Browser-based processing, privacy-first, no signup required. Trusted by millions of users worldwide."
        keywords="about toolmaster pro, free online tools platform, browser-based tools, privacy-first tools, no registration tools, free web utilities, toolmaster pro team, online productivity tools, free tools no signup"
        canonical="https://toolmaster.cloud/about"
        breadcrumbs={[
          { name: "Home", url: "https://toolmaster.cloud/" },
          { name: "About", url: "https://toolmaster.cloud/about" },
        ]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "@id": "https://toolmaster.cloud/about",
            name: "About ToolMaster Pro",
            description: "Learn about ToolMaster Pro: 150+ free professional online tools. Browser-based, privacy-first, no signup required.",
            url: "https://toolmaster.cloud/about",
            isPartOf: { "@id": "https://toolmaster.cloud/#website" },
            about: { "@id": "https://toolmaster.cloud/#organization" },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://toolmaster.cloud/#organization",
            name: "ToolMaster Pro",
            url: "https://toolmaster.cloud/",
            description: "ToolMaster Pro provides 150+ free online tools — image, PDF, video, AI writing, calculators and more. No signup required, browser-based, privacy-first.",
            foundingDate: "2024",
            logo: {
              "@type": "ImageObject",
              url: "https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/uploads/1759510903222-toolmasterpro logo.jpeg",
              width: 512,
              height: 512,
            },
            sameAs: [
              "https://twitter.com/ToolMasterPro",
              "https://www.facebook.com/ToolMasterPro",
              "https://www.linkedin.com/company/toolmasterpro",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer support",
              url: "https://toolmaster.cloud/contact",
              availableLanguage: "English",
            },
          },
        ]}
      />
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10 gradient-hero animate-gradient-xy" />
        <div className="container max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            ABOUT US
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight mb-4">
            Built for Everyone.<br />
            <span className="text-gradient">Free for Everyone.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            ToolMasterPro is a comprehensive platform offering 150+ free online tools designed to simplify your daily tasks — no signup, no fees, no nonsense.
          </p>
        </div>
      </section>

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-12 space-y-12">

        {/* Mission */}
        <section className="bg-card rounded-2xl border border-border/60 p-8 shadow-card">
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed text-base mb-3">
            We believe powerful online tools shouldn't come with a paywall or require lengthy sign-up processes. Our mission is to <strong className="text-foreground">democratize access to professional-grade web utilities</strong>, making productivity tools available to everyone, everywhere, completely free.
          </p>
          <p className="text-muted-foreground leading-relaxed text-base">
            No credit card. No trial periods. No limitations. Just tools that work.
          </p>
        </section>

        {/* Values Grid */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-foreground text-center mb-8">What Drives Us</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-card rounded-2xl border border-border/60 p-6 shadow-card hover:border-primary/40 transition-all">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ad Break */}
        <AdRow />

        {/* Why Us */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-foreground text-center mb-2">Why Choose ToolMasterPro?</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            Four reasons users choose us over the rest.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 p-5 bg-card rounded-2xl border border-border/60 shadow-card">
                <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3">
            Ready to explore?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Browse 150+ professional tools. No signup, no fees, instant access.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-11"
            >
              <Link to="/tools">
                Browse All Tools <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="rounded-xl px-6 h-11 font-bold"
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
