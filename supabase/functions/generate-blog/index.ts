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
    const { topic, blogType, wordCount, targetAudience, tone, keywords, includeImages, additionalNotes } = await req.json();
    
    if (!topic || !blogType || !wordCount) {
      return new Response(
        JSON.stringify({ error: 'Topic, blog type, and word count are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Write a ${wordCount}-word ${blogType} blog article on: "${topic}"
Target Audience: ${targetAudience}
Tone: ${tone}
${keywords ? `SEO Keywords to include: ${keywords}` : ''}
${includeImages ? `Include image placeholders with [Image: description]` : ''}
${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}

Requirements:
- Create an engaging, SEO-optimized title
- Write a compelling introduction with a hook
- Use clear headings and subheadings (H2, H3)
- Include bullet points or numbered lists where appropriate
- Incorporate the SEO keywords naturally
- Add a strong call-to-action in conclusion
- Make it scannable and reader-friendly
- Target exactly ${wordCount} words
- Use engaging, conversational language
- Include practical tips or actionable advice

Write the complete blog article now with proper formatting:`;

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
            content: 'You are an expert blog writer and content marketer. Create engaging, SEO-optimized blog articles that capture attention and provide value to readers.'
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
      throw new Error('Failed to generate blog article');
    }

    const data = await response.json();
    const blog = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ blog }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-blog function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while generating blog article';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
