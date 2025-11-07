import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, Copy, RefreshCw } from "lucide-react";

const TaglineGenerator = () => {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("general");
  const [tone, setTone] = useState("professional");
  const [taglines, setTaglines] = useState<string[]>([]);

  const templates = {
    professional: [
      "Where {name} Meets Excellence",
      "Your Trusted {industry} Partner",
      "{name} - Built on Trust",
      "Excellence in {industry}",
      "Delivering {industry} Solutions",
      "Your {industry} Experts",
      "{name} - Quality First",
      "Professional {industry} Services"
    ],
    friendly: [
      "Making {industry} Simple",
      "Your {industry} Friend",
      "{name} - Always Here for You",
      "Easy {industry}, Happy You",
      "We Make {industry} Fun",
      "{name} - Like Family",
      "Your Friendly {industry} Team",
      "Smile More with {name}"
    ],
    bold: [
      "Redefining {industry}",
      "{name} - Lead the Change",
      "Disrupting {industry}",
      "The Future of {industry}",
      "{name} - Break the Rules",
      "Dare to Be Different",
      "Revolution in {industry}",
      "{name} - No Limits"
    ],
    inspirational: [
      "Dream. Build. Achieve.",
      "Empowering Your {industry} Journey",
      "{name} - Believe in Better",
      "Transform Your {industry}",
      "Inspiring {industry} Excellence",
      "Your Success, Our Mission",
      "{name} - Reach Higher",
      "Where Dreams Meet {industry}"
    ]
  };

  const actionWords = {
    general: ["Innovate", "Transform", "Elevate", "Empower", "Create", "Build", "Grow", "Achieve"],
    technology: ["Connect", "Innovate", "Automate", "Optimize", "Scale", "Integrate", "Stream", "Sync"],
    healthcare: ["Heal", "Care", "Nurture", "Restore", "Protect", "Improve", "Enhance", "Sustain"],
    education: ["Learn", "Grow", "Discover", "Master", "Develop", "Excel", "Evolve", "Progress"],
    finance: ["Invest", "Grow", "Secure", "Prosper", "Build", "Protect", "Maximize", "Achieve"],
    retail: ["Shop", "Save", "Discover", "Experience", "Enjoy", "Choose", "Find", "Explore"],
    food: ["Taste", "Savor", "Enjoy", "Delight", "Indulge", "Experience", "Relish", "Feast"]
  };

  const valueWords = ["Quality", "Innovation", "Trust", "Excellence", "Integrity", "Passion", "Commitment", "Dedication"];

  const generateTaglines = () => {
    if (!businessName.trim()) {
      toast.error("Please enter a business name");
      return;
    }

    const generated: string[] = [];
    const name = businessName.trim();
    const toneTemplates = templates[tone as keyof typeof templates];
    const actions = actionWords[industry as keyof typeof actionWords] || actionWords.general;

    // Type 1: Template-based taglines
    toneTemplates.forEach(template => {
      let tagline = template.replace(/{name}/g, name);
      tagline = tagline.replace(/{industry}/g, industry === "general" ? "Business" : industry.charAt(0).toUpperCase() + industry.slice(1));
      generated.push(tagline);
    });

    // Type 2: Action word + Value word
    actions.forEach(action => {
      valueWords.forEach(value => {
        generated.push(`${action} with ${value}`);
      });
    });

    // Type 3: Simple powerful statements
    const powerStatements = [
      `${name} - Simply Better`,
      `Think ${name}`,
      `${name}. Done Right.`,
      `Experience ${name}`,
      `${name} - The Smart Choice`,
      `Powered by ${name}`,
      `Choose ${name}`,
      `${name} Makes It Easy`
    ];
    generated.push(...powerStatements);

    // Type 4: Action-oriented
    actions.forEach(action => {
      generated.push(`${action} More. Stress Less.`);
      generated.push(`${action} Better with ${name}`);
    });

    // Type 5: Customer-focused
    const customerFocused = [
      "Your Success, Our Priority",
      "Built for You",
      "Making Life Easier",
      "You Deserve the Best",
      "Your Satisfaction Guaranteed",
      "We Work for You",
      "Your Goals, Our Mission",
      "Putting You First"
    ];
    generated.push(...customerFocused);

    // Remove duplicates and limit to 50
    const unique = Array.from(new Set(generated)).slice(0, 50);
    setTaglines(unique);
    toast.success(`Generated ${unique.length} taglines!`);
  };

  const copyTagline = (tagline: string) => {
    navigator.clipboard.writeText(tagline);
    toast.success(`Copied: ${tagline}`);
  };

  return (
    <ToolLayout
      title="Tagline Generator"
      description="Generate catchy taglines and slogans for your business. Perfect for branding, marketing, and advertising. Free slogan generator."
      category="Generators"
      instructions={[
        "Enter your business or brand name",
        "Select your industry",
        "Choose the tone that fits your brand",
        "Click generate to see tagline suggestions",
        "Copy your favorite taglines"
      ]}
      relatedTools={[
        { name: "Business Name Generator", path: "/tools/business-name-generator" },
        { name: "Company Name Generator", path: "/tools/company-name-generator" },
        { name: "Instagram Bio Generator", path: "/tools/instagram-bio-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="business-name">Business/Brand Name</Label>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., TechFlow, FreshBite, SmartCare"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateTaglines} className="w-full" size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Taglines
            </Button>
          </CardContent>
        </Card>

        {taglines.length > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Generated Taglines ({taglines.length})
                  </h3>
                </div>
                <Button onClick={generateTaglines} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {taglines.map((tagline, index) => (
                  <button
                    key={index}
                    onClick={() => copyTagline(tagline)}
                    className="p-4 bg-muted/50 hover:bg-primary/10 rounded-lg text-left border border-transparent hover:border-primary/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-lg">{tagline}</span>
                      <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Great Tagline Characteristics</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Short & Sweet:</strong> Best taglines are under 7 words</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Memorable:</strong> Use rhythm, rhyme, or alliteration when possible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Clear Message:</strong> Communicate your value proposition clearly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Emotional:</strong> Connect with your audience's feelings and aspirations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Unique:</strong> Differentiate from competitors with distinctive messaging</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Timeless:</strong> Avoid trendy language that will date quickly</span>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Pro Tip:</strong> Test your tagline with your target audience before finalizing.
                A great tagline should be easy to remember and resonate with your customers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default TaglineGenerator;
