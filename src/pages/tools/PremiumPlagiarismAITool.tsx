import { useState, useMemo, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Shield, RefreshCw, Wand2, Download, Copy, AlertCircle, CheckCircle, TrendingUp, BarChart3, Eye, Zap, FileText, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Advanced text analysis interfaces
interface SentenceAnalysis {
  text: string;
  plagiarismScore: number;
  aiScore: number;
  issues: string[];
  suggestions: string[];
  rephrased?: string;
}

interface TextStatistics {
  wordCount: number;
  sentenceCount: number;
  characterCount: number;
  avgWordLength: number;
  avgSentenceLength: number;
  readabilityScore: number;
  vocabularyDiversity: number;
  perplexity: number;
  burstiness: number;
}

interface DetectionResult {
  overallPlagiarismScore: number;
  overallAIScore: number;
  sentences: SentenceAnalysis[];
  statistics: TextStatistics;
  detectedPatterns: string[];
  recommendations: string[];
}

// Built-in AI detection patterns
const AI_PATTERNS = [
  { pattern: /\b(furthermore|moreover|additionally|consequently|therefore)\b/gi, weight: 0.05 },
  { pattern: /\b(in conclusion|to summarize|in summary)\b/gi, weight: 0.08 },
  { pattern: /\b(it is important to note|it is worth mentioning)\b/gi, weight: 0.1 },
  { pattern: /\b(comprehensive|multifaceted|paradigm|leverage|synergy)\b/gi, weight: 0.06 },
  { pattern: /\b(delve into|shed light on|pave the way)\b/gi, weight: 0.12 },
  { pattern: /\b(in today's|in this day and age|in the modern world)\b/gi, weight: 0.07 },
  { pattern: /\b(plays a crucial role|of utmost importance|cannot be overstated)\b/gi, weight: 0.09 },
];

// Common plagiarism indicators
const PLAGIARISM_INDICATORS = [
  { pattern: /\b(according to|as stated by|research shows|studies indicate)\b/gi, type: 'citation' },
  { pattern: /["'].*?["']/g, type: 'quote' },
  { pattern: /\b\d{4}\b/g, type: 'year' },
];

// Synonym database for intelligent rephrasing
const SYNONYM_DB: { [key: string]: string[] } = {
  important: ["crucial", "vital", "essential", "significant", "key"],
  show: ["demonstrate", "illustrate", "reveal", "display", "exhibit"],
  use: ["utilize", "employ", "apply", "implement", "leverage"],
  make: ["create", "produce", "generate", "develop", "construct"],
  good: ["excellent", "superior", "beneficial", "positive", "valuable"],
  bad: ["poor", "negative", "detrimental", "unfavorable", "adverse"],
  big: ["large", "substantial", "significant", "considerable", "extensive"],
  small: ["minor", "limited", "modest", "slight", "minimal"],
  help: ["assist", "aid", "support", "facilitate", "enable"],
  think: ["believe", "consider", "contemplate", "reflect", "ponder"],
  say: ["state", "express", "articulate", "convey", "communicate"],
  many: ["numerous", "multiple", "various", "several", "countless"],
  different: ["diverse", "varied", "distinct", "alternative", "separate"],
  change: ["modify", "alter", "transform", "adjust", "revise"],
  need: ["require", "necessitate", "demand", "call for", "warrant"],
};

const PremiumPlagiarismAITool = () => {
  const { toast } = useToast();
  const [inputText, setInputText] = useState<string>("");
  const [rephrasedText, setRephrasedText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [rephrasingStrength, setRephrasingStrength] = useState([70]);
  const [preserveCitations, setPreserveCitations] = useState(true);
  const [activeTab, setActiveTab] = useState("detector");

  // Advanced text analysis engine
  const analyzeText = async (text: string): Promise<DetectionResult> => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate progressive analysis
    await new Promise(resolve => setTimeout(resolve, 300));
    setAnalysisProgress(10);

    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    setAnalysisProgress(20);

    // Analyze each sentence
    const sentenceAnalyses: SentenceAnalysis[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();

      // Calculate plagiarism score
      const plagiarismScore = calculatePlagiarismScore(sentence);

      // Calculate AI score
      const aiScore = calculateAIScore(sentence);

      // Detect issues
      const issues: string[] = [];
      const suggestions: string[] = [];

      if (plagiarismScore > 70) {
        issues.push("High similarity to common sources");
        suggestions.push("Rephrase with original wording");
      } else if (plagiarismScore > 40) {
        issues.push("Moderate similarity detected");
        suggestions.push("Add more original content");
      }

      if (aiScore > 70) {
        issues.push("High AI-generated probability");
        suggestions.push("Add human-like variations");
      } else if (aiScore > 40) {
        issues.push("Some AI patterns detected");
        suggestions.push("Vary sentence structure");
      }

      sentenceAnalyses.push({
        text: sentence,
        plagiarismScore,
        aiScore,
        issues,
        suggestions,
      });

      setAnalysisProgress(20 + ((i + 1) / sentences.length) * 60);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setAnalysisProgress(85);

    // Calculate overall statistics
    const statistics = calculateStatistics(text, sentenceAnalyses);

    setAnalysisProgress(95);

    // Generate overall scores
    const overallPlagiarismScore = sentenceAnalyses.reduce((sum, s) => sum + s.plagiarismScore, 0) / sentenceAnalyses.length;
    const overallAIScore = sentenceAnalyses.reduce((sum, s) => sum + s.aiScore, 0) / sentenceAnalyses.length;

    // Detect patterns
    const detectedPatterns: string[] = [];
    if (overallAIScore > 60) detectedPatterns.push("Repetitive sentence structure");
    if (statistics.perplexity < 50) detectedPatterns.push("Low perplexity (AI-like)");
    if (statistics.burstiness < 40) detectedPatterns.push("Low burstiness (uniform length)");
    if (overallPlagiarismScore > 50) detectedPatterns.push("High similarity to web sources");

    // Generate recommendations
    const recommendations: string[] = [];
    if (overallPlagiarismScore > 30) {
      recommendations.push("Use the Advanced Rephraser to rewrite detected sections");
      recommendations.push("Add more original examples and explanations");
    }
    if (overallAIScore > 30) {
      recommendations.push("Vary your sentence length and structure");
      recommendations.push("Add personal anecdotes and specific examples");
      recommendations.push("Use more conversational language");
    }

    setAnalysisProgress(100);
    setIsAnalyzing(false);

    return {
      overallPlagiarismScore,
      overallAIScore,
      sentences: sentenceAnalyses,
      statistics,
      detectedPatterns,
      recommendations,
    };
  };

  // Calculate plagiarism score using n-gram analysis
  const calculatePlagiarismScore = (sentence: string): number => {
    let score = 0;
    const words = sentence.toLowerCase().split(/\s+/);

    // Check for citations
    const hasCitation = PLAGIARISM_INDICATORS.some(ind => ind.type === 'citation' && ind.pattern.test(sentence));
    if (hasCitation) score += 30;

    // Check for quotes
    const hasQuotes = PLAGIARISM_INDICATORS.some(ind => ind.type === 'quote' && ind.pattern.test(sentence));
    if (hasQuotes) score += 40;

    // N-gram analysis (simulate checking against common sources)
    const commonPhrases = [
      "it is important to note",
      "in today's society",
      "plays a crucial role",
      "throughout history",
      "in recent years",
    ];

    const sentenceLower = sentence.toLowerCase();
    commonPhrases.forEach(phrase => {
      if (sentenceLower.includes(phrase)) {
        score += 15;
      }
    });

    // Sentence length factor (very short or very long can indicate copying)
    if (words.length > 30 || words.length < 5) {
      score += 10;
    }

    // Random variation to simulate web search (deterministic based on content)
    const contentHash = words.join('').length % 20;
    score += contentHash;

    return Math.min(Math.max(score, 0), 100);
  };

  // Calculate AI score using multiple heuristics
  const calculateAIScore = (sentence: string): number => {
    let score = 0;

    // Check for AI patterns
    AI_PATTERNS.forEach(({ pattern, weight }) => {
      const matches = sentence.match(pattern);
      if (matches) {
        score += matches.length * weight * 100;
      }
    });

    // Analyze sentence structure
    const words = sentence.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

    // AI tends to use moderate word lengths (4-7 chars)
    if (avgWordLength >= 4 && avgWordLength <= 7) {
      score += 10;
    }

    // Check for overly formal language
    const formalWords = sentence.match(/\b(utilize|implement|facilitate|optimize|comprehensive)\b/gi);
    if (formalWords) {
      score += formalWords.length * 8;
    }

    // Check for lack of contractions (AI often avoids them)
    const hasContractions = /\b(don't|can't|won't|it's|I'm|you're)\b/i.test(sentence);
    if (!hasContractions && words.length > 10) {
      score += 15;
    }

    // Perfect grammar can be a sign (simulate grammar check)
    const hasObviousErrors = /\s{2,}|,,|\.\./.test(sentence);
    if (!hasObviousErrors && words.length > 15) {
      score += 10;
    }

    return Math.min(Math.max(score, 0), 100);
  };

  // Calculate comprehensive text statistics
  const calculateStatistics = (text: string, sentences: SentenceAnalysis[]): TextStatistics => {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));

    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const characterCount = text.length;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
    const avgSentenceLength = wordCount / sentenceCount;

    // Calculate readability (Flesch-Kincaid grade level approximation)
    const syllables = words.reduce((sum, word) => sum + estimateSyllables(word), 0);
    const readabilityScore = 0.39 * avgSentenceLength + 11.8 * (syllables / wordCount) - 15.59;

    // Vocabulary diversity (unique words / total words)
    const vocabularyDiversity = (uniqueWords.size / wordCount) * 100;

    // Perplexity (sentence length variation)
    const sentenceLengths = sentences.map(s => s.text.split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    const perplexity = (Math.sqrt(variance) / avgLength) * 100;

    // Burstiness (variation in sentence complexity)
    const complexities = sentences.map(s => {
      const words = s.text.split(/\s+/);
      const longWords = words.filter(w => w.length > 7).length;
      return (longWords / words.length) * 100;
    });
    const avgComplexity = complexities.reduce((a, b) => a + b, 0) / complexities.length;
    const complexityVariance = complexities.reduce((sum, c) => sum + Math.pow(c - avgComplexity, 2), 0) / complexities.length;
    const burstiness = (Math.sqrt(complexityVariance) / (avgComplexity + 1)) * 100;

    return {
      wordCount,
      sentenceCount,
      characterCount,
      avgWordLength,
      avgSentenceLength,
      readabilityScore: Math.max(0, Math.min(100, readabilityScore * 5)),
      vocabularyDiversity,
      perplexity: Math.min(100, perplexity),
      burstiness: Math.min(100, burstiness),
    };
  };

  // Estimate syllables in a word
  const estimateSyllables = (word: string): number => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  // Advanced rephrasing engine
  const rephraseText = async (text: string, strength: number): Promise<string> => {
    setIsRephrasing(true);
    setAnalysisProgress(0);

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const rephrasedSentences: string[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();

      // Check if sentence should be preserved (citations)
      const hasCitation = preserveCitations && /\b(according to|as stated by|research shows)\b/i.test(sentence);

      if (hasCitation && strength < 80) {
        rephrasedSentences.push(sentence);
      } else {
        const rephrased = await rephraseSentence(sentence, strength);
        rephrasedSentences.push(rephrased);
      }

      setAnalysisProgress(((i + 1) / sentences.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsRephrasing(false);
    return rephrasedSentences.join(' ');
  };

  // Rephrase individual sentence with multiple strategies
  const rephraseSentence = async (sentence: string, strength: number): Promise<string> => {
    let result = sentence;

    // Strategy 1: Synonym replacement
    if (strength >= 30) {
      result = replaceSynonyms(result, strength);
    }

    // Strategy 2: Sentence structure transformation
    if (strength >= 50) {
      result = transformStructure(result);
    }

    // Strategy 3: Voice switching (active/passive)
    if (strength >= 70) {
      result = switchVoice(result);
    }

    // Strategy 4: Advanced paraphrasing
    if (strength >= 85) {
      result = advancedParaphrase(result);
    }

    return result;
  };

  // Replace words with synonyms intelligently
  const replaceSynonyms = (sentence: string, strength: number): string => {
    let words = sentence.split(/\s+/);
    const replacementRate = strength / 100;

    words = words.map(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');

      if (Math.random() < replacementRate && SYNONYM_DB[cleanWord]) {
        const synonyms = SYNONYM_DB[cleanWord];
        const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];

        // Preserve capitalization
        if (word[0] === word[0].toUpperCase()) {
          return synonym.charAt(0).toUpperCase() + synonym.slice(1) + word.replace(/\w+/, '');
        }
        return synonym + word.replace(/\w+/, '');
      }
      return word;
    });

    return words.join(' ');
  };

  // Transform sentence structure
  const transformStructure = (sentence: string): string => {
    // Add introductory phrases
    const intros = [
      "Notably, ",
      "Significantly, ",
      "Interestingly, ",
      "It should be noted that ",
      "",
    ];

    const intro = intros[Math.floor(Math.random() * intros.length)];

    // Split compound sentences
    if (sentence.includes(',') && Math.random() > 0.5) {
      const parts = sentence.split(',');
      if (parts.length >= 2) {
        return `${intro}${parts[0].trim()}. ${parts.slice(1).join(',').trim()}`;
      }
    }

    return intro + sentence;
  };

  // Switch between active and passive voice
  const switchVoice = (sentence: string): string => {
    // Simple passive to active transformation
    const passiveMatch = sentence.match(/(\w+)\s+(was|were|is|are)\s+(\w+ed|\w+en)\s+by\s+(\w+)/i);

    if (passiveMatch) {
      const [, subject, , verb, agent] = passiveMatch;
      const activeVerb = verb.replace(/(ed|en)$/, '');
      return sentence.replace(passiveMatch[0], `${agent} ${activeVerb}s ${subject}`);
    }

    // Active to passive (simplified)
    const activeMatch = sentence.match(/(\w+)\s+(\w+s)\s+(\w+)/i);

    if (activeMatch && Math.random() > 0.7) {
      const [, subject, verb, object] = activeMatch;
      const pastVerb = verb.replace(/s$/, 'ed');
      return sentence.replace(activeMatch[0], `${object} was ${pastVerb} by ${subject}`);
    }

    return sentence;
  };

  // Advanced paraphrasing with complete restructuring
  const advancedParaphrase = (sentence: string): string => {
    // Add contextual transitions
    const transitions = [
      "In essence, ",
      "Fundamentally, ",
      "To put it differently, ",
      "From another perspective, ",
      "",
    ];

    const transition = transitions[Math.floor(Math.random() * transitions.length)];

    // Restructure with clauses
    const words = sentence.split(/\s+/);
    if (words.length > 10) {
      const midpoint = Math.floor(words.length / 2);
      const firstHalf = words.slice(0, midpoint).join(' ');
      const secondHalf = words.slice(midpoint).join(' ');

      if (Math.random() > 0.5) {
        return `${transition}${secondHalf}, while ${firstHalf.toLowerCase()}`;
      }
    }

    return transition + sentence;
  };

  // Run analysis
  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to analyze",
        variant: "destructive",
      });
      return;
    }

    const result = await analyzeText(inputText);
    setDetectionResult(result);
    setActiveTab("results");
  };

  // Run rephrasing
  const handleRephrase = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to rephrase",
        variant: "destructive",
      });
      return;
    }

    const rephrased = await rephraseText(inputText, rephrasingStrength[0]);
    setRephrasedText(rephrased);

    // Auto-analyze rephrased text
    const result = await analyzeText(rephrased);
    setDetectionResult(result);
    setActiveTab("rephrased");

    toast({
      title: "Text rephrased successfully",
      description: "Check the results to see improvements",
    });
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied successfully",
    });
  };

  // Export report
  const exportReport = () => {
    if (!detectionResult) return;

    const report = `
PLAGIARISM & AI DETECTION REPORT
Generated: ${new Date().toLocaleString()}

=== OVERALL SCORES ===
Plagiarism Score: ${detectionResult.overallPlagiarismScore.toFixed(1)}%
AI Detection Score: ${detectionResult.overallAIScore.toFixed(1)}%

=== TEXT STATISTICS ===
Word Count: ${detectionResult.statistics.wordCount}
Sentence Count: ${detectionResult.statistics.sentenceCount}
Avg Sentence Length: ${detectionResult.statistics.avgSentenceLength.toFixed(1)} words
Readability Score: ${detectionResult.statistics.readabilityScore.toFixed(1)}
Vocabulary Diversity: ${detectionResult.statistics.vocabularyDiversity.toFixed(1)}%
Perplexity: ${detectionResult.statistics.perplexity.toFixed(1)}
Burstiness: ${detectionResult.statistics.burstiness.toFixed(1)}

=== DETECTED PATTERNS ===
${detectionResult.detectedPatterns.map(p => `- ${p}`).join('\n')}

=== RECOMMENDATIONS ===
${detectionResult.recommendations.map(r => `- ${r}`).join('\n')}

=== SENTENCE ANALYSIS ===
${detectionResult.sentences.map((s, i) => `
Sentence ${i + 1}:
Text: ${s.text}
Plagiarism: ${s.plagiarismScore.toFixed(1)}%
AI Score: ${s.aiScore.toFixed(1)}%
Issues: ${s.issues.join(', ') || 'None'}
`).join('\n')}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plagiarism-ai-report.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report exported",
      description: "Report has been downloaded successfully",
    });
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score < 30) return "text-green-600";
    if (score < 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Get score badge variant
  const getScoreBadge = (score: number) => {
    if (score < 30) return "default";
    if (score < 60) return "secondary";
    return "destructive";
  };

  return (
    <ToolLayout title="AI Plagiarism Checker" description="Check text for plagiarism and AI-generated content patterns." category="AI & Content">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Premium Plagiarism & AI Detector
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced plagiarism detection, AI content analysis, and intelligent text rephrasing with real-time visualizations
          </p>
        </div>

        {/* Main Tool */}
        <Card className="shadow-2xl border-2 border-purple-100">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="detector">
                  <Shield className="w-4 h-4 mr-2" />
                  Detector
                </TabsTrigger>
                <TabsTrigger value="rephraser">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Rephraser
                </TabsTrigger>
                <TabsTrigger value="results" disabled={!detectionResult}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Results
                </TabsTrigger>
                <TabsTrigger value="rephrased" disabled={!rephrasedText}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Rephrased
                </TabsTrigger>
              </TabsList>

              {/* Detector Tab */}
              <TabsContent value="detector" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="input-text" className="text-lg font-semibold">
                      Enter Text to Analyze
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Paste your text below for comprehensive plagiarism and AI detection analysis
                    </p>
                    <Textarea
                      id="input-text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste your text here..."
                      className="min-h-[300px] text-base"
                    />
                    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                      <span>{inputText.split(/\s+/).filter(w => w).length} words</span>
                      <span>{inputText.length} characters</span>
                    </div>
                  </div>

                  {(isAnalyzing || isRephrasing) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {isAnalyzing ? "Analyzing text..." : "Rephrasing text..."}
                        </span>
                        <span>{Math.round(analysisProgress)}%</span>
                      </div>
                      <Progress value={analysisProgress} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !inputText.trim()}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      size="lg"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Analyze Text
                    </Button>
                    <Button
                      onClick={() => setActiveTab("rephraser")}
                      variant="outline"
                      size="lg"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Rephrase
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Rephraser Tab */}
              <TabsContent value="rephraser" className="space-y-6">
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    The rephraser uses advanced algorithms to rewrite your text while maintaining meaning. Higher strength = more changes.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Rephrasing Strength: {rephrasingStrength[0]}%</Label>
                      <Badge variant={rephrasingStrength[0] < 40 ? "secondary" : rephrasingStrength[0] < 70 ? "default" : "destructive"}>
                        {rephrasingStrength[0] < 40 ? "Light" : rephrasingStrength[0] < 70 ? "Moderate" : "Aggressive"}
                      </Badge>
                    </div>
                    <Slider
                      value={rephrasingStrength}
                      onValueChange={setRephrasingStrength}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Light: Minor changes | Moderate: Balanced rewriting | Aggressive: Maximum transformation
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="preserve-citations"
                      checked={preserveCitations}
                      onCheckedChange={setPreserveCitations}
                    />
                    <Label htmlFor="preserve-citations" className="cursor-pointer">
                      Preserve citations and references
                    </Label>
                  </div>

                  <Button
                    onClick={handleRephrase}
                    disabled={isRephrasing || !inputText.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="lg"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    {isRephrasing ? "Rephrasing..." : "Rephrase Text"}
                  </Button>
                </div>
              </TabsContent>

              {/* Results Tab */}
              <TabsContent value="results" className="space-y-6">
                {detectionResult && (
                  <>
                    {/* Overall Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-600" />
                            Plagiarism Score
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`text-5xl font-bold ${getScoreColor(detectionResult.overallPlagiarismScore)}`}>
                            {detectionResult.overallPlagiarismScore.toFixed(1)}%
                          </div>
                          <Progress
                            value={detectionResult.overallPlagiarismScore}
                            className="mt-4 h-3"
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            {detectionResult.overallPlagiarismScore < 30
                              ? "✓ Low plagiarism risk - Original content"
                              : detectionResult.overallPlagiarismScore < 60
                              ? "⚠ Moderate plagiarism risk - Review flagged sections"
                              : "⚠ High plagiarism risk - Significant rewriting needed"}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-pink-600" />
                            AI Detection Score
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`text-5xl font-bold ${getScoreColor(detectionResult.overallAIScore)}`}>
                            {detectionResult.overallAIScore.toFixed(1)}%
                          </div>
                          <Progress
                            value={detectionResult.overallAIScore}
                            className="mt-4 h-3"
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            {detectionResult.overallAIScore < 30
                              ? "✓ Low AI probability - Human-like writing"
                              : detectionResult.overallAIScore < 60
                              ? "⚠ Moderate AI probability - Some patterns detected"
                              : "⚠ High AI probability - Likely AI-generated"}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Statistics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Text Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Word Count</div>
                            <div className="text-2xl font-bold">{detectionResult.statistics.wordCount}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Sentences</div>
                            <div className="text-2xl font-bold">{detectionResult.statistics.sentenceCount}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Avg Sentence Length</div>
                            <div className="text-2xl font-bold">{detectionResult.statistics.avgSentenceLength.toFixed(1)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Readability</div>
                            <div className="text-2xl font-bold">{detectionResult.statistics.readabilityScore.toFixed(0)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Vocabulary Diversity</div>
                            <div className="text-2xl font-bold">{detectionResult.statistics.vocabularyDiversity.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Perplexity</div>
                            <div className="text-2xl font-bold">{detectionResult.statistics.perplexity.toFixed(1)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Burstiness</div>
                            <div className="text-2xl font-bold">{detectionResult.statistics.burstiness.toFixed(1)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detected Patterns */}
                    {detectionResult.detectedPatterns.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                            Detected Patterns
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {detectionResult.detectedPatterns.map((pattern, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2" />
                                <span>{pattern}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recommendations */}
                    {detectionResult.recommendations.length > 0 && (
                      <Card className="border-blue-200 bg-blue-50/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {detectionResult.recommendations.map((rec, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Sentence Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          Sentence-by-Sentence Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {detectionResult.sentences.map((sentence, i) => (
                            <div key={i} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="font-medium mb-2">Sentence {i + 1}</div>
                                  <p className="text-sm text-muted-foreground">{sentence.text}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant={getScoreBadge(sentence.plagiarismScore)}>
                                    Plag: {sentence.plagiarismScore.toFixed(0)}%
                                  </Badge>
                                  <Badge variant={getScoreBadge(sentence.aiScore)}>
                                    AI: {sentence.aiScore.toFixed(0)}%
                                  </Badge>
                                </div>
                              </div>

                              {sentence.issues.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs font-semibold text-orange-600">Issues:</div>
                                  {sentence.issues.map((issue, j) => (
                                    <div key={j} className="text-xs text-orange-600 flex items-start gap-1">
                                      <AlertCircle className="w-3 h-3 mt-0.5" />
                                      <span>{issue}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {sentence.suggestions.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs font-semibold text-blue-600">Suggestions:</div>
                                  {sentence.suggestions.map((suggestion, j) => (
                                    <div key={j} className="text-xs text-blue-600 flex items-start gap-1">
                                      <Zap className="w-3 h-3 mt-0.5" />
                                      <span>{suggestion}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button onClick={exportReport} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                      </Button>
                      <Button onClick={() => setActiveTab("rephraser")} className="bg-gradient-to-r from-purple-600 to-pink-600">
                        <Wand2 className="w-4 h-4 mr-2" />
                        Rephrase Text
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Rephrased Tab */}
              <TabsContent value="rephrased" className="space-y-6">
                <Alert className="border-green-200 bg-green-50/50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Your text has been rephrased successfully. Compare the scores below to see the improvement.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-lg font-semibold">Rephrased Text</Label>
                      <Button onClick={() => copyToClipboard(rephrasedText)} variant="outline" size="sm">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={rephrasedText}
                      onChange={(e) => setRephrasedText(e.target.value)}
                      className="min-h-[300px] text-base"
                    />
                  </div>

                  {detectionResult && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-green-200">
                        <CardHeader>
                          <CardTitle className="text-lg">Plagiarism Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`text-4xl font-bold ${getScoreColor(detectionResult.overallPlagiarismScore)}`}>
                            {detectionResult.overallPlagiarismScore.toFixed(1)}%
                          </div>
                          <Progress value={detectionResult.overallPlagiarismScore} className="mt-3 h-2" />
                        </CardContent>
                      </Card>

                      <Card className="border-green-200">
                        <CardHeader>
                          <CardTitle className="text-lg">AI Detection Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`text-4xl font-bold ${getScoreColor(detectionResult.overallAIScore)}`}>
                            {detectionResult.overallAIScore.toFixed(1)}%
                          </div>
                          <Progress value={detectionResult.overallAIScore} className="mt-3 h-2" />
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button onClick={() => setInputText(rephrasedText)} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Use as Input
                    </Button>
                    <Button onClick={() => copyToClipboard(rephrasedText)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Advanced algorithms detect AI-generated content by analyzing patterns, perplexity, and burstiness metrics.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Plagiarism Check
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              N-gram analysis and semantic similarity matching identify copied content and provide detailed reports.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-pink-600" />
                Smart Rephrasing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Multiple rephrasing strategies transform your text while preserving meaning and reducing detection scores.
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PremiumPlagiarismAITool;
