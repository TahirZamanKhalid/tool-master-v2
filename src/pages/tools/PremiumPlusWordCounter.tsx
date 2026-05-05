import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileText, Target, Clock, TrendingUp, BookOpen, Brain, Sparkles, Copy, Download, Eye, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface ReadingStats {
  readingTime: number;
  speakingTime: number;
  readabilityScore: number;
  gradeLevel: string;
}

interface WritingAnalytics {
  avgWordLength: number;
  avgSentenceLength: number;
  longestWord: string;
  longestSentence: number;
  vocabularyDiversity: number;
  sentenceComplexity: string;
  paragraphCount: number;
}

interface CharacterBreakdown {
  letters: number;
  digits: number;
  spaces: number;
  punctuation: number;
  special: number;
}

const PremiumPlusWordCounter = () => {
  const { toast } = useToast();
  const [text, setText] = useState<string>("");

  // Basic counts
  const basicStats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
    const lines = text.split(/\n/).length;

    return { characters, charactersNoSpaces, words, sentences, paragraphs, lines };
  }, [text]);

  // Character breakdown
  const charBreakdown = useMemo((): CharacterBreakdown => {
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const digits = (text.match(/[0-9]/g) || []).length;
    const spaces = (text.match(/\s/g) || []).length;
    const punctuation = (text.match(/[.,;:!?'"()-]/g) || []).length;
    const special = text.length - letters - digits - spaces - punctuation;

    return { letters, digits, spaces, punctuation, special };
  }, [text]);

  // Reading & Speaking time
  const readingStats = useMemo((): ReadingStats => {
    const wordsPerMinuteReading = 200;
    const wordsPerMinuteSpeaking = 150;

    const readingTime = Math.ceil(basicStats.words / wordsPerMinuteReading);
    const speakingTime = Math.ceil(basicStats.words / wordsPerMinuteSpeaking);

    // Simple Flesch-Kincaid grade level approximation
    const avgSentenceLength = basicStats.words / (basicStats.sentences || 1);
    const syllables = text.split(/\s+/).reduce((sum, word) => sum + estimateSyllables(word), 0);
    const avgSyllablesPerWord = syllables / (basicStats.words || 1);

    const fleschScore = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
    const readabilityScore = Math.max(0, Math.min(100, fleschScore));

    let gradeLevel = "College Graduate";
    if (readabilityScore >= 90) gradeLevel = "5th Grade";
    else if (readabilityScore >= 80) gradeLevel = "6th Grade";
    else if (readabilityScore >= 70) gradeLevel = "7th Grade";
    else if (readabilityScore >= 60) gradeLevel = "8th-9th Grade";
    else if (readabilityScore >= 50) gradeLevel = "10th-12th Grade";
    else if (readabilityScore >= 30) gradeLevel = "College";

    return { readingTime, speakingTime, readabilityScore, gradeLevel };
  }, [text, basicStats]);

  // Writing analytics
  const analytics = useMemo((): WritingAnalytics => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    const avgWordLength = words.length > 0
      ? words.reduce((sum, word) => sum + word.replace(/[^\w]/g, '').length, 0) / words.length
      : 0;

    const avgSentenceLength = words.length / (sentences.length || 1);

    const longestWord = words.length > 0
      ? words.reduce((longest, word) => {
          const cleanWord = word.replace(/[^\w]/g, '');
          return cleanWord.length > longest.length ? cleanWord : longest;
        }, '')
      : '';

    const longestSentence = sentences.length > 0
      ? Math.max(...sentences.map(s => s.trim().split(/\s+/).length))
      : 0;

    // Vocabulary diversity (unique words / total words)
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^\w]/g, '')));
    const vocabularyDiversity = words.length > 0 ? (uniqueWords.size / words.length) * 100 : 0;

    // Sentence complexity
    let sentenceComplexity = "Simple";
    if (avgSentenceLength > 25) sentenceComplexity = "Very Complex";
    else if (avgSentenceLength > 20) sentenceComplexity = "Complex";
    else if (avgSentenceLength > 15) sentenceComplexity = "Moderate";

    return {
      avgWordLength,
      avgSentenceLength,
      longestWord,
      longestSentence,
      vocabularyDiversity,
      sentenceComplexity,
      paragraphCount: basicStats.paragraphs
    };
  }, [text, basicStats]);

  // Keyword density (top 10 words)
  const keywordDensity = useMemo(() => {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3); // Filter out short words

    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({
        word,
        count,
        percentage: ((count / words.length) * 100).toFixed(2)
      }));
  }, [text]);

  // Estimate syllables in a word
  const estimateSyllables = (word: string): number => {
    word = word.toLowerCase().replace(/[^\w]/g, '');
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  // Copy to clipboard
  const copyStats = () => {
    const stats = `
TEXT STATISTICS REPORT
Generated: ${new Date().toLocaleString()}

=== BASIC COUNTS ===
Words: ${basicStats.words}
Characters: ${basicStats.characters}
Characters (no spaces): ${basicStats.charactersNoSpaces}
Sentences: ${basicStats.sentences}
Paragraphs: ${basicStats.paragraphs}
Lines: ${basicStats.lines}

=== READING TIME ===
Reading Time: ${readingStats.readingTime} min
Speaking Time: ${readingStats.speakingTime} min
Readability Score: ${readingStats.readabilityScore.toFixed(1)}
Grade Level: ${readingStats.gradeLevel}

=== WRITING ANALYTICS ===
Average Word Length: ${analytics.avgWordLength.toFixed(1)} characters
Average Sentence Length: ${analytics.avgSentenceLength.toFixed(1)} words
Longest Word: ${analytics.longestWord}
Longest Sentence: ${analytics.longestSentence} words
Vocabulary Diversity: ${analytics.vocabularyDiversity.toFixed(1)}%
Sentence Complexity: ${analytics.sentenceComplexity}

=== CHARACTER BREAKDOWN ===
Letters: ${charBreakdown.letters}
Digits: ${charBreakdown.digits}
Spaces: ${charBreakdown.spaces}
Punctuation: ${charBreakdown.punctuation}
Special: ${charBreakdown.special}

=== TOP KEYWORDS ===
${keywordDensity.map(k => `${k.word}: ${k.count} (${k.percentage}%)`).join('\n')}
    `;

    navigator.clipboard.writeText(stats);
    toast({ title: "Statistics copied to clipboard!" });
  };

  // Download report
  const downloadReport = () => {
    const stats = `
TEXT STATISTICS REPORT
Generated: ${new Date().toLocaleString()}

=== BASIC COUNTS ===
Words: ${basicStats.words}
Characters: ${basicStats.characters}
Characters (no spaces): ${basicStats.charactersNoSpaces}
Sentences: ${basicStats.sentences}
Paragraphs: ${basicStats.paragraphs}
Lines: ${basicStats.lines}

=== READING TIME ===
Reading Time: ${readingStats.readingTime} min
Speaking Time: ${readingStats.speakingTime} min
Readability Score: ${readingStats.readabilityScore.toFixed(1)}
Grade Level: ${readingStats.gradeLevel}

=== WRITING ANALYTICS ===
Average Word Length: ${analytics.avgWordLength.toFixed(1)} characters
Average Sentence Length: ${analytics.avgSentenceLength.toFixed(1)} words
Longest Word: ${analytics.longestWord}
Longest Sentence: ${analytics.longestSentence} words
Vocabulary Diversity: ${analytics.vocabularyDiversity.toFixed(1)}%
Sentence Complexity: ${analytics.sentenceComplexity}

=== CHARACTER BREAKDOWN ===
Letters: ${charBreakdown.letters}
Digits: ${charBreakdown.digits}
Spaces: ${charBreakdown.spaces}
Punctuation: ${charBreakdown.punctuation}
Special: ${charBreakdown.special}

=== TOP KEYWORDS ===
${keywordDensity.map(k => `${k.word}: ${k.count} (${k.percentage}%)`).join('\n')}
    `;

    const blob = new Blob([stats], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-statistics-report.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Report downloaded successfully!" });
  };

  return (
    <ToolLayout title="Advanced Word Counter" description="Count words, characters, sentences and get detailed text statistics." category="Text Tools">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Premium Plus Word Counter
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced text analysis with reading time, writing analytics, readability scores, and keyword density
          </p>
          <Badge variant="secondary" className="text-sm">Premium Plus Edition</Badge>
        </div>

        {/* Input Area */}
        <Card className="shadow-2xl border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Enter Your Text
            </CardTitle>
            <CardDescription>Paste or type your text below for comprehensive analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing or paste your text here..."
              className="min-h-[300px] text-base font-mono"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{basicStats.words} words • {basicStats.characters} characters</span>
              <div className="flex gap-2">
                <Button onClick={copyStats} variant="outline" size="sm" disabled={!text}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Stats
                </Button>
                <Button onClick={downloadReport} variant="outline" size="sm" disabled={!text}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Tabs */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">
              <FileText className="w-4 h-4 mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="reading">
              <Clock className="w-4 h-4 mr-2" />
              Reading
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Brain className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="characters">
              <BarChart3 className="w-4 h-4 mr-2" />
              Characters
            </TabsTrigger>
            <TabsTrigger value="keywords">
              <Target className="w-4 h-4 mr-2" />
              Keywords
            </TabsTrigger>
          </TabsList>

          {/* Basic Stats Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Words</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{basicStats.words}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Characters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{basicStats.characters}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Characters (No Spaces)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-600">{basicStats.charactersNoSpaces}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Sentences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{basicStats.sentences}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Paragraphs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{basicStats.paragraphs}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Lines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-pink-600">{basicStats.lines}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reading Stats Tab */}
          <TabsContent value="reading" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    Reading Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-blue-600">{readingStats.readingTime} min</div>
                  <p className="text-sm text-muted-foreground mt-2">Based on 200 words per minute</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Speaking Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-purple-600">{readingStats.speakingTime} min</div>
                  <p className="text-sm text-muted-foreground mt-2">Based on 150 words per minute</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Readability Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Flesch Reading Ease Score</span>
                    <Badge>{readingStats.readabilityScore.toFixed(1)}</Badge>
                  </div>
                  <Progress value={readingStats.readabilityScore} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">Higher scores indicate easier reading</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Target Audience:</span>
                    <Badge variant="secondary">{readingStats.gradeLevel}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Average Word Length</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.avgWordLength.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">characters</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Average Sentence Length</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.avgSentenceLength.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">words</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Longest Word</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold break-all">{analytics.longestWord || 'N/A'}</div>
                  <p className="text-sm text-muted-foreground">{analytics.longestWord.length} characters</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Longest Sentence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.longestSentence}</div>
                  <p className="text-sm text-muted-foreground">words</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vocabulary Diversity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.vocabularyDiversity.toFixed(1)}%</div>
                  <Progress value={analytics.vocabularyDiversity} className="mt-2 h-2" />
                  <p className="text-sm text-muted-foreground mt-1">Unique words / Total words</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sentence Complexity</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="text-lg px-4 py-2">{analytics.sentenceComplexity}</Badge>
                  <p className="text-sm text-muted-foreground mt-2">Based on average sentence length</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Character Breakdown Tab */}
          <TabsContent value="characters" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Letters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{charBreakdown.letters}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((charBreakdown.letters / basicStats.characters) * 100 || 0).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Digits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{charBreakdown.digits}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((charBreakdown.digits / basicStats.characters) * 100 || 0).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Spaces</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{charBreakdown.spaces}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((charBreakdown.spaces / basicStats.characters) * 100 || 0).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Punctuation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{charBreakdown.punctuation}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((charBreakdown.punctuation / basicStats.characters) * 100 || 0).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Special Characters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-pink-600">{charBreakdown.special}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((charBreakdown.special / basicStats.characters) * 100 || 0).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Keywords Tab */}
          <TabsContent value="keywords" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Top 10 Keywords (4+ characters)
                </CardTitle>
                <CardDescription>Most frequently used words in your text</CardDescription>
              </CardHeader>
              <CardContent>
                {keywordDensity.length > 0 ? (
                  <div className="space-y-3">
                    {keywordDensity.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <Badge className="w-8 h-8 flex items-center justify-center">{index + 1}</Badge>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{item.word}</span>
                            <span className="text-sm text-muted-foreground">{item.count} times ({item.percentage}%)</span>
                          </div>
                          <Progress value={parseFloat(item.percentage) * 10} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No keywords to display. Start typing to see keyword analysis.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  );
};

export default PremiumPlusWordCounter;
