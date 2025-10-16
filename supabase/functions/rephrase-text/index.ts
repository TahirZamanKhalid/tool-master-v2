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
    const { text, tone = 'standard' } = await req.json();
    
    if (!text || text.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: 'Text must be at least 5 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const toneInstructions = {
      standard: 'Rephrase the text in a clear, neutral tone.',
      professional: 'Rephrase the text in a professional, business-appropriate tone.',
      casual: 'Rephrase the text in a casual, conversational tone.',
      formal: 'Rephrase the text in a formal, academic tone.',
      friendly: 'Rephrase the text in a warm, friendly, and approachable tone.',
      academic: 'Rephrase the text in a scholarly, academic tone with precise language.',
      creative: 'Rephrase the text in a creative, engaging tone with vivid language.',
    };

    const toneInstruction = toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.standard;

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
            content: `You are a professional text rephraser. ${toneInstruction} Preserve the original meaning and all key information. Use different words and sentence structures. Return ONLY the rephrased text without any explanations, quotes, or meta-commentary.`
          },
          {
            role: 'user',
            content: `Rephrase this text:\n\n${text}`
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
      throw new Error('Failed to rephrase text');
    }

    const data = await response.json();
    const rephrasedText = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ rephrasedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in rephrase-text function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while rephrasing text';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
