import { useState } from "react";
import { faqData } from "@/data/faqData";
import { ChevronDown, HelpCircle } from "lucide-react";

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="py-20 px-4 bg-muted/20 border-t border-border/40">
      <div className="container max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-5">
            <HelpCircle className="h-4 w-4" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">
            Everything you need to <span className="text-gradient">know</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Quick answers to the most common questions about ToolMaster Pro
          </p>
        </div>

        {/* Two-column FAQ grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-primary/40 bg-card shadow-card-hover"
                    : "border-border/60 bg-card hover:border-primary/20 hover:shadow-card"
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-start gap-4 p-5 text-left group"
                  aria-expanded={isOpen}
                >
                  {/* Number badge */}
                  <span className={`shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black transition-colors duration-200 ${
                    isOpen ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  }`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={`flex-1 text-sm font-bold leading-snug transition-colors duration-200 ${
                    isOpen ? "text-primary" : "text-foreground group-hover:text-primary"
                  }`}>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`shrink-0 h-4 w-4 mt-0.5 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                    }`}
                  />
                </button>
                {/* Answer */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed pl-16">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Still have questions?{" "}
            <a
              href="/contact"
              className="text-primary font-semibold hover:underline"
            >
              Contact our support team →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
