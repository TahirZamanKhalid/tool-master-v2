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
    const { essayType, topic, wordCount, academicLevel, tone, additionalInstructions } = await req.json();
    
    if (!topic || !essayType || !wordCount) {
      return new Response(
        JSON.stringify({ error: 'Essay type, topic, and word count are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Write a ${wordCount}-word ${essayType} essay on the topic: "${topic}".
Academic Level: ${academicLevel}
Tone: ${tone}
${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ''}

Requirements:
- Follow proper essay structure (introduction, body paragraphs, conclusion)
- Include a strong thesis statement
- Provide evidence and examples
- Use clear topic sentences
- Maintain academic integrity
- Format with proper paragraphs
- Target exactly ${wordCount} words

Write the complete essay now:`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic writer who creates well-structured, original essays. Write complete essays with proper formatting and academic rigor.'
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
      throw new Error('Failed to generate essay');
    }

    const data = await response.json();
    const essay = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ essay }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-essay function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while generating essay';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
