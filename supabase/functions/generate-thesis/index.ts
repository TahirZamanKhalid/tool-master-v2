import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { researchTopic, fieldOfStudy, wordCount, chapterType, researchQuestions, methodology, additionalContext } = await req.json();
    
    if (!researchTopic || !fieldOfStudy || !wordCount || !chapterType) {
      return new Response(
        JSON.stringify({ error: 'Research topic, field of study, word count, and chapter type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Write a ${wordCount}-word ${chapterType} for a thesis/dissertation on: "${researchTopic}"
Field of Study: ${fieldOfStudy}
${researchQuestions ? `Research Questions: ${researchQuestions}` : ''}
${methodology ? `Methodology: ${methodology}` : ''}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Requirements:
- Follow academic thesis structure and conventions
- Include proper citations (use Author Year format as placeholders)
- Use scholarly tone and language
- Provide comprehensive analysis
- Include relevant theoretical frameworks
- Format with proper sections and subsections
- Target exactly ${wordCount} words
- Maintain academic rigor and originality

Write the complete ${chapterType} now:`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic researcher and thesis writer. Create comprehensive, well-researched thesis content with proper academic structure and citations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('Failed to generate thesis content');
    }

    const data = await response.json();
    const thesis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ thesis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-thesis function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while generating thesis';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
