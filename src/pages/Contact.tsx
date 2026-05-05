import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Mail, MessageSquare, Send, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const validated = contactSchema.parse(formData);
      const res = await fetch("/api-proxy.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-contact-email", ...validated }),
      });
      if (!res.ok) throw new Error("Proxy error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Contact Us — ToolMaster Pro"
        description="Questions, feedback, or partnership inquiries? Get in touch with the ToolMasterPro team."
        keywords="contact, support, feedback, help, customer service"
        canonical="https://toolmaster.cloud/contact"
      />
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10 gradient-hero animate-gradient-xy" />
        <div className="container max-w-5xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            GET IN TOUCH
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight mb-3">
            Let's Talk
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Questions, feedback, or partnership ideas? We'd love to hear from you.
          </p>
        </div>
      </section>

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-[280px_1fr] gap-8">

          {/* Left: Contact Info */}
          <aside className="space-y-3">
            <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-card">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Email</h3>
              <a href="mailto:tzaman208@gmail.com" className="text-sm text-primary hover:underline">
                tzaman208@gmail.com
              </a>
            </div>

            <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-card">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>

            <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-card">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Response Time</h3>
              <p className="text-sm text-muted-foreground">Usually within 24 hours</p>
            </div>
          </aside>

          {/* Right: Form */}
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border/60 p-6 md:p-8 shadow-card space-y-5">
            <h2 className="text-xl font-black text-foreground mb-1">Send a message</h2>
            <p className="text-sm text-muted-foreground mb-2">All fields are required.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Name</label>
                <Input
                  id="name"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Subject</label>
              <Input
                id="subject"
                placeholder="What's this about?"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="h-11 rounded-xl"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Message</label>
              <Textarea
                id="message"
                placeholder="Tell us what's on your mind..."
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="rounded-xl resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/25"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : (<><Send className="mr-2 h-4 w-4" /> Send Message</>)}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
