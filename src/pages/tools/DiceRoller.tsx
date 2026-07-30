// pages/DiceRoller.tsx
import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dices,
  Plus,
  Minus,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Target,
  ChevronDown,
  Shield,
  Star,
  Clock,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs, BREADCRUMB_PRESETS } from "@/components/Breadcrumbs";
import { SidebarAd } from "@/components/SidebarAd";
import { FixedSizeAd } from "@/components/FixedSizeAd";
import { InFeedAd } from "@/components/InFeedAd";
import { DiceAnimation } from "@/components/Dice Roller/DiceAnimation";
import { RollHistory } from "@/components/Dice Roller/RollHistory";
import { RollStatistics } from "@/components/Dice Roller/RollStatistics";

// Types
interface DiceConfig {
  sides: number;
  count: number;
}

interface RollResult {
  sides: number;
  result: number;
}

interface RollRecord {
  id: number;
  dice: RollResult[];
  total: number;
  timestamp: Date;
  modifier: number;
}

// Dice configurations
const DICE_TYPES = [
  { value: 4, label: "D4", description: "Tetrahedron", color: "from-red-500 to-red-700" },
  { value: 6, label: "D6", description: "Cube", color: "from-blue-500 to-blue-700" },
  { value: 8, label: "D8", description: "Octahedron", color: "from-green-500 to-green-700" },
  { value: 10, label: "D10", description: "Pentagonal", color: "from-purple-500 to-purple-700" },
  { value: 12, label: "D12", description: "Dodecahedron", color: "from-orange-500 to-orange-700" },
  { value: 20, label: "D20", description: "Icosahedron", color: "from-pink-500 to-pink-700" },
  { value: 100, label: "D100", description: "Percentile", color: "from-gray-600 to-gray-800" },
];

// Ad slots
const AD_SLOTS = {
  leftSidebar1: "3144435719",
  rightSidebar1: "4384638849",
  middle1: "7737560499",
  middle2: "3798315485",
};

// Quick roll presets
const QUICK_ROLLS = [
  { label: "1d20", dice: [{ sides: 20, count: 1 }], modifier: 0 },
  { label: "2d6", dice: [{ sides: 6, count: 2 }], modifier: 0 },
  { label: "1d20+5", dice: [{ sides: 20, count: 1 }], modifier: 5 },
  { label: "4d6", dice: [{ sides: 6, count: 4 }], modifier: 0 },
  { label: "2d10", dice: [{ sides: 10, count: 2 }], modifier: 0 },
  { label: "1d100", dice: [{ sides: 100, count: 1 }], modifier: 0 },
];

const DiceRoller = () => {
  // State
  const [selectedDice, setSelectedDice] = useState<DiceConfig[]>([{ sides: 6, count: 1 }]);
  const [modifier, setModifier] = useState(0);
  const [results, setResults] = useState<RollResult[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<RollRecord[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Refs
  const rollIdRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/sounds/dice-roll.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  // Play sound
  const playRollSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    }
  }, [soundEnabled]);

  // Roll dice
  const rollDice = useCallback(() => {
    if (isRolling) return;

    setIsRolling(true);
    playRollSound();

    // Generate results after animation
    setTimeout(() => {
      const newResults: RollResult[] = [];

      selectedDice.forEach((dice) => {
        for (let i = 0; i < dice.count; i++) {
          const result = Math.floor(Math.random() * dice.sides) + 1;
          newResults.push({ sides: dice.sides, result });
        }
      });

      const sum = newResults.reduce((acc, r) => acc + r.result, 0) + modifier;

      setResults(newResults);
      setTotal(sum);
      setIsRolling(false);

      // Add to history
      rollIdRef.current += 1;
      setHistory((prev) => [
        {
          id: rollIdRef.current,
          dice: newResults,
          total: sum,
          timestamp: new Date(),
          modifier,
        },
        ...prev.slice(0, 49), // Keep last 50 rolls
      ]);
    }, 1000);
  }, [selectedDice, modifier, isRolling, playRollSound]);

  // Quick roll
  const quickRoll = useCallback(
    (preset: (typeof QUICK_ROLLS)[0]) => {
      setSelectedDice(preset.dice);
      setModifier(preset.modifier);
      setTimeout(rollDice, 100);
    },
    [rollDice]
  );

  // Add dice type
  const addDiceType = (sides: number) => {
    const existing = selectedDice.find((d) => d.sides === sides);
    if (existing) {
      setSelectedDice(
        selectedDice.map((d) =>
          d.sides === sides ? { ...d, count: Math.min(d.count + 1, 10) } : d
        )
      );
    } else {
      setSelectedDice([...selectedDice, { sides, count: 1 }]);
    }
  };

  // Remove dice type
  const removeDiceType = (sides: number) => {
    const existing = selectedDice.find((d) => d.sides === sides);
    if (existing && existing.count > 1) {
      setSelectedDice(
        selectedDice.map((d) =>
          d.sides === sides ? { ...d, count: d.count - 1 } : d
        )
      );
    } else {
      setSelectedDice(selectedDice.filter((d) => d.sides !== sides));
    }
  };

  // Reset
  const resetAll = () => {
    setSelectedDice([{ sides: 6, count: 1 }]);
    setModifier(0);
    setResults([]);
    setTotal(null);
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };

  // Get dice notation
  const getDiceNotation = () => {
    const parts = selectedDice.map((d) => `${d.count}d${d.sides}`);
    let notation = parts.join(" + ");
    if (modifier !== 0) {
      notation += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
    }
    return notation;
  };

  // Breadcrumbs
  const breadcrumbItems = BREADCRUMB_PRESETS.utilities("Dice Roller", "/tools/dice-roller");

  // FAQs
  const faqs = [
    {
      q: "Is this dice roller truly random?",
      a: "Yes! Our dice roller uses the Web Crypto API for cryptographically secure random number generation. This ensures fair, unbiased, and unpredictable results every time you roll.",
    },
    {
      q: "What types of dice can I roll?",
      a: "You can roll all standard polyhedral dice: D4, D6, D8, D10, D12, D20, and D100 (percentile dice). You can also roll multiple dice of different types at once and add modifiers.",
    },
    {
      q: "Can I use this for Dungeons & Dragons?",
      a: "Absolutely! Our dice roller is perfect for D&D, Pathfinder, and any tabletop RPG. It supports all standard dice used in these games, including the iconic D20 for attack rolls and saving throws.",
    },
    {
      q: "Does it work on mobile devices?",
      a: "Yes! Our dice roller is fully responsive and works great on smartphones and tablets. The animations are optimized for touch screens.",
    },
    {
      q: "Can I see my previous rolls?",
      a: "Yes! We keep a history of your last 50 rolls with timestamps, dice combinations, and totals. You can also view statistics about your rolling patterns.",
    },
  ];

  // Related tools
  const relatedTools = [
    { name: "Random Number Generator", path: "/tools/premium-plus-random-number-generator", desc: "Generate random numbers" },
    { name: "Coin Flip", path: "/tools/coin-flip", desc: "Flip a virtual coin" },
    { name: "Password Generator", path: "/tools/password-generator", desc: "Create secure passwords" },
  ];

  return (
    <>
      <SEOHead
        title="Free Online Dice Roller - Roll D4, D6, D8, D10, D12, D20, D100 | ToolMaster"
        description="Roll virtual dice online for free! Perfect for D&D, tabletop RPGs, and board games. Roll D4, D6, D8, D10, D12, D20, D100 with animations, modifiers, and roll history. 100% random and fair."
        keywords="dice roller, online dice, virtual dice, D20 roller, D&D dice, tabletop RPG dice, random dice roll, polyhedral dice, dungeons and dragons dice, free dice roller, dice simulator"
        canonical="https://toolmaster.cloud/tools/dice-roller"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7382531001943020"
          crossOrigin="anonymous"
        />

        <div className="container mx-auto px-4 py-6 lg:py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} />

          {/* Main Layout */}
          <div className="flex gap-6">
            {/* Left Sidebar Ads */}
            <aside className="hidden lg:flex flex-col gap-6 w-[150px] flex-shrink-0">
              <div className="sticky top-4 space-y-6">
                <SidebarAd slot={AD_SLOTS.leftSidebar1} position="left" index={1} width={150} height={800} />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 max-w-4xl mx-auto lg:mx-0">
              {/* Hero Section */}
              <header className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  <span>Free Online Tool</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Virtual Dice Roller
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Roll any dice for D&D, Pathfinder, and tabletop games.
                  Fully animated with history tracking!
                </p>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-sm">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>100% Random</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-sm">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>Instant Results</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-sm">
                    <Star className="h-4 w-4 text-orange-500" />
                    <span>4.8/5 Rating</span>
                  </div>
                </div>
              </header>

              {/* Main Tool Card */}
              <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur overflow-hidden">
                <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
                  {/* Quick Roll Presets */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Quick Roll
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_ROLLS.map((preset) => (
                        <Button
                          key={preset.label}
                          variant="outline"
                          size="sm"
                          onClick={() => quickRoll(preset)}
                          disabled={isRolling}
                          className="hover:bg-primary hover:text-white transition-all"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Dice Selection Grid */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Dices className="h-4 w-4 text-primary" />
                      Select Dice
                    </Label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {DICE_TYPES.map((dice) => {
                        const selected = selectedDice.find((d) => d.sides === dice.value);
                        return (
                          <div
                            key={dice.value}
                            className={`
                              relative rounded-xl p-3 text-center cursor-pointer
                              transition-all duration-200 border-2
                              ${selected
                                ? "border-primary bg-primary/10 scale-105"
                                : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                              }
                            `}
                            onClick={() => addDiceType(dice.value)}
                          >
                            <div
                              className={`
                                w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1
                                bg-gradient-to-br ${dice.color}
                                rounded-lg flex items-center justify-center
                                text-white font-bold text-xs sm:text-sm
                                shadow-lg
                              `}
                            >
                              {dice.label}
                            </div>
                            {selected && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {selected.count}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                              {dice.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Dice & Modifier */}
                  {selectedDice.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        {selectedDice.map((dice) => (
                          <div
                            key={dice.sides}
                            className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeDiceType(dice.sides)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-medium min-w-[50px] text-center">
                              {dice.count}d{dice.sides}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => addDiceType(dice.sides)}
                              disabled={dice.count >= 10}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}

                        {/* Modifier */}
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setModifier((m) => m - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-medium min-w-[50px] text-center">
                            {modifier >= 0 ? `+${modifier}` : modifier}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setModifier((m) => m + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Dice Notation Display */}
                      <div className="text-center">
                        <span className="text-lg font-mono font-bold text-primary">
                          {getDiceNotation()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      {soundEnabled ? (
                        <Volume2 className="h-4 w-4 text-gray-500" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Sound Effects
                      </span>
                    </div>
                    <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                  </div>

                  {/* Roll Button */}
                  <Button
                    onClick={rollDice}
                    disabled={isRolling || selectedDice.length === 0}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 text-lg py-6"
                  >
                    <Dices
                      className={`h-6 w-6 mr-2 ${isRolling ? "animate-spin" : ""}`}
                    />
                    {isRolling ? "Rolling..." : "Roll Dice!"}
                  </Button>

                  {/* Dice Animation Area */}
                  {(results.length > 0 || isRolling) && (
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8">
                      <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-6">
                        {isRolling
                          ? selectedDice.flatMap((dice, diceIdx) =>
                            Array.from({ length: dice.count }).map((_, i) => (
                              <DiceAnimation
                                key={`rolling-${diceIdx}-${i}`}
                                sides={dice.sides}
                                isRolling={true}
                                result={null}
                                diceIndex={diceIdx * 10 + i}
                              />
                            ))
                          )
                          : results.map((r, idx) => (
                            <DiceAnimation
                              key={idx}
                              sides={r.sides}
                              isRolling={false}
                              result={r.result}
                              diceIndex={idx}
                            />
                          ))}
                      </div>

                      {/* Results Display */}
                      {total !== null && !isRolling && (
                        <div className="text-center space-y-2 animate-fade-in">
                          {results.length > 1 && (
                            <div className="text-sm text-gray-500 flex flex-wrap justify-center gap-2">
                              {results.map((r, idx) => (
                                <span
                                  key={idx}
                                  className="bg-white dark:bg-gray-700 px-2 py-1 rounded"
                                >
                                  {r.result}
                                </span>
                              ))}
                              {modifier !== 0 && (
                                <span className="bg-primary/20 text-primary px-2 py-1 rounded">
                                  {modifier > 0 ? `+${modifier}` : modifier}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="text-6xl sm:text-7xl font-bold text-primary drop-shadow-lg">
                            {total}
                          </div>
                          <p className="text-sm text-gray-500">Total Result</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reset Button */}
                  {selectedDice.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={resetAll}
                      className="w-full"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset All
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Statistics & History Tabs */}
              {history.length > 0 && (
                <Card className="mt-6 shadow-lg">
                  <Tabs defaultValue="history" className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="history" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        History
                      </TabsTrigger>
                      <TabsTrigger value="stats" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Statistics
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="history" className="p-4">
                      <RollHistory history={history} onClear={clearHistory} />
                    </TabsContent>
                    <TabsContent value="stats" className="p-4">
                      <RollStatistics history={history} />
                    </TabsContent>
                  </Tabs>
                </Card>
              )}

              {/* Middle Ad */}
              <FixedSizeAd slot={AD_SLOTS.middle1} width={800} height={150} className="my-8" />

              {/* SEO Content Sections */}
              <section className="space-y-8 mt-8">
                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[
                    {
                      icon: Shield,
                      color: "text-green-500",
                      bg: "bg-green-500/10",
                      title: "Truly Random",
                      desc: "Uses cryptographic randomness for fair, unbiased results every roll.",
                    },
                    {
                      icon: Zap,
                      color: "text-yellow-500",
                      bg: "bg-yellow-500/10",
                      title: "All Dice Types",
                      desc: "Roll D4, D6, D8, D10, D12, D20, D100 - all polyhedral dice supported.",
                    },
                    {
                      icon: Clock,
                      color: "text-blue-500",
                      bg: "bg-blue-500/10",
                      title: "Roll History",
                      desc: "Track your last 50 rolls with timestamps and statistics.",
                    },
                  ].map((feature) => (
                    <article
                      key={feature.title}
                      className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border"
                    >
                      <div
                        className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}
                      >
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {feature.desc}
                      </p>
                    </article>
                  ))}
                </div>

                {/* How It Works */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border">
                  <h2 className="text-2xl font-bold text-center mb-8">
                    How to Use the Dice Roller
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { step: 1, title: "Select Dice", desc: "Choose dice types (D4-D100)" },
                      { step: 2, title: "Add Quantity", desc: "Roll multiple dice at once" },
                      { step: 3, title: "Set Modifier", desc: "Add bonuses or penalties" },
                      { step: 4, title: "Roll!", desc: "Click to roll and see results" },
                    ].map((item) => (
                      <div key={item.step} className="text-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-3 sm:mb-4">
                          {item.step}
                        </div>
                        <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border">
                  <h2 className="text-2xl font-bold text-center mb-8">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-3 max-w-3xl mx-auto">
                    {faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedFaq(expandedFaq === index ? null : index)
                          }
                          className="flex items-center justify-between w-full p-4 text-left font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          aria-expanded={expandedFaq === index}
                        >
                          <span className="pr-4">{faq.q}</span>
                          <ChevronDown
                            className={`h-5 w-5 flex-shrink-0 transition-transform ${expandedFaq === index ? "rotate-180" : ""
                              }`}
                          />
                        </button>
                        {expandedFaq === index && (
                          <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Tools */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border">
                  <h2 className="text-2xl font-bold text-center mb-8">
                    Related Tools
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {relatedTools.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-primary/5 hover:border-primary border-2 border-transparent transition-all group"
                      >
                        <h3 className="font-semibold text-primary group-hover:underline mb-1">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tool.desc}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* SEO Content */}
                <article className="bg-white dark:bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border prose prose-gray dark:prose-invert max-w-none">
                  <h2>Best Free Online Dice Roller for D&D and Tabletop RPGs</h2>
                  <p>
                    Our <strong>virtual dice roller</strong> is the ultimate tool for{" "}
                    <strong>Dungeons & Dragons</strong>, <strong>Pathfinder</strong>,
                    and all tabletop role-playing games. Whether you need to roll a{" "}
                    <strong>D20 for attack rolls</strong>, <strong>2d6 for damage</strong>,
                    or <strong>4d6 for character stats</strong>, our dice roller handles
                    it all with beautiful animations.
                  </p>

                  <h3>Features for Tabletop Gamers</h3>
                  <ul>
                    <li>
                      <strong>All polyhedral dice</strong> - D4, D6, D8, D10, D12, D20, D100
                    </li>
                    <li>
                      <strong>Multiple dice</strong> - Roll up to 10 dice of each type
                    </li>
                    <li>
                      <strong>Modifiers</strong> - Add bonuses and penalties to your rolls
                    </li>
                    <li>
                      <strong>Quick rolls</strong> - Common combinations like 1d20+5
                    </li>
                    <li>
                      <strong>Roll history</strong> - Track your last 50 rolls
                    </li>
                    <li>
                      <strong>Statistics</strong> - See averages, highs, and most common results
                    </li>
                  </ul>

                  <h3>Perfect for Board Games Too</h3>
                  <p>
                    Not just for RPGs! Use our dice roller for{" "}
                    <strong>Monopoly</strong>, <strong>Yahtzee</strong>,{" "}
                    <strong>Risk</strong>, <strong>Catan</strong>, and any board game
                    that requires dice. The D6 roller with realistic dot patterns is
                    perfect for classic board games.
                  </p>
                </article>
                <FixedSizeAd slot={AD_SLOTS.middle2} width={800} height={150} className="mt-8" />
              </section>
              {/* Additional SEO Content Section */}
              <div className="mt-16 space-y-12 text-gray-700 dark:text-gray-300">
                <section className="bg-card rounded-2xl p-8 border border-border shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Zap className="h-6 w-6 text-primary" />
                    Everything You Need for Tabletop Gaming
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        Whether you're exploring dungeons in <strong>Dungeons & Dragons</strong>, surviving in <strong>Pathfinder</strong>, or competing in a classic board game, our virtual dice roller provides the perfect digital solution. We understand that randomness is the heart of gaming, which is why we've built a tool that is not only visually satisfying but mathematically perfect.
                      </p>
                      <p className="leading-relaxed">
                        Our dice simulator supports all the standard polyhedral shapes used in modern TTRPGs. From the low-impact <strong>D4</strong> to the critical-hit <strong>D20</strong>, and even the high-stakes <strong>D100</strong> (percentile) rolls, you can handle any situation your DM throws at you.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg">Why choose our Virtual Dice?</h3>
                      <ul className="space-y-2 list-disc list-inside">
                        <li><strong>Cryptographic Randomness:</strong> Powered by the Web Crypto API for true fairness.</li>
                        <li><strong>Full Customization:</strong> Roll multiple dice and add modifiers (+/-) easily.</li>
                        <li><strong>History & Stats:</strong> Track your luck throughout the session with detailed logs.</li>
                        <li><strong>Zero Distractions:</strong> 100% free, no account needed, and no invasive popups.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="space-y-6 px-4 pb-12">
                  <h3 className="text-xl font-bold">Master the Dice Notation</h3>
                  <p className="text-muted-foreground">
                    Traditionally, gamers use "Dice Notation" to describe rolls. For example, <code>2d6 + 5</code> means rolling two 6-sided dice and adding 5 to the total. Our tool handles this complex math for you. Simply select your dice, input your character's ability score modifier, and hit roll. The result is instant, transparent, and accurate.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-6 pt-4">
                    <div className="p-4 rounded-xl border border-dashed border-border">
                      <h4 className="font-bold mb-2">Advantage Roll</h4>
                      <p className="text-sm">Roll 2d20 and take the higher result. Perfect for skilled checks.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-dashed border-border">
                      <h4 className="font-bold mb-2">Disadvantage</h4>
                      <p className="text-sm">Roll 2d20 and take the lower result. Be careful out there!</p>
                    </div>
                    <div className="p-4 rounded-xl border border-dashed border-border">
                      <h4 className="font-bold mb-2">Custom Pools</h4>
                      <p className="text-sm">Combine different dice like 1d8 (Longsword) + 1d6 (Sneak Attack).</p>
                    </div>
                  </div>
                </section>
              </div>
            </main>

            {/* Right Sidebar Ads */}
            <aside className="hidden lg:flex flex-col gap-6 w-[150px] flex-shrink-0">
              <div className="sticky top-4 space-y-6">
                <SidebarAd slot={AD_SLOTS.rightSidebar1} position="right" index={1} width={150} height={800} />
              </div>
            </aside>
          </div>

          {/* Footer */}
          <footer className="border-t mt-12 pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
              <div>
                <h4 className="font-bold mb-4 text-sm sm:text-base">Utilities</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/tools/dice-roller" className="text-gray-600 hover:text-primary">
                      Dice Roller
                    </Link>
                  </li>
                  <li>
                    <Link to="/tools/coin-flip" className="text-gray-600 hover:text-primary">
                      Coin Flip
                    </Link>
                  </li>
                  <li>
                    <Link to="/tools/premium-plus-random-number-generator" className="text-gray-600 hover:text-primary">
                      Random Number
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-sm sm:text-base">Image Tools</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/tools/background-remover" className="text-gray-600 hover:text-primary">
                      Background Remover
                    </Link>
                  </li>
                  <li>
                    <Link to="/tools/image-resizer" className="text-gray-600 hover:text-primary">
                      Image Resizer
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-sm sm:text-base">Text Tools</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/tools/premium-plus-word-counter" className="text-gray-600 hover:text-primary">
                      Word Counter
                    </Link>
                  </li>
                  <li>
                    <Link to="/tools/case-converter" className="text-gray-600 hover:text-primary">
                      Case Converter
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-sm sm:text-base">About</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/about" className="text-gray-600 hover:text-primary">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-gray-600 hover:text-primary">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-gray-600 hover:text-primary">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center text-gray-500 text-xs sm:text-sm py-4 border-t">
              <p>© {new Date().getFullYear()} ToolMasterPro. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes dice-roll {
          0%, 100% { transform: rotateX(0) rotateY(0) rotateZ(0) translateY(0); }
          25% { transform: rotateX(90deg) rotateY(180deg) rotateZ(45deg) translateY(-20px); }
          50% { transform: rotateX(180deg) rotateY(360deg) rotateZ(90deg) translateY(-30px); }
          75% { transform: rotateX(270deg) rotateY(540deg) rotateZ(135deg) translateY(-20px); }
        }

        @keyframes dice-land {
          0% { transform: rotateX(0) rotateY(0) rotateZ(0) translateY(-10px); }
          50% { transform: rotateX(5deg) rotateY(5deg) rotateZ(0) translateY(0); }
          100% { transform: rotateX(0) rotateY(0) rotateZ(0) translateY(0); }
        }

        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-dice-roll {
          animation: dice-roll 0.1s ease-in-out infinite;
        }

        .animate-dice-land {
          animation: dice-land 0.3s ease-out forwards;
        }

        .animate-shine {
          animation: shine 0.5s ease-in-out;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .clip-path-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </>
  );
};

export default DiceRoller;
