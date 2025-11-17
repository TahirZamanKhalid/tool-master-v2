import { MousePointer, Zap, Download } from "lucide-react";


const steps = [
  {
    icon: MousePointer,
    title: "Choose Tool",
    description: "Browse 100+ tools or search for what you need",
  },
  {
    icon: Zap,
    title: "Use Instantly",
    description: "No signup required - start using immediately",
  },
  {
    icon: Download,
    title: "Download Results",
    description: "Get your processed files in seconds",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">Simple, fast, and completely free</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary text-white mb-4 text-xl font-bold">
                {index + 1}
              </div>
              <div className="mb-4">
                <step.icon className="h-8 w-8 mx-auto text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
