import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, style, description } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const stylePrompts: Record<string, string> = {
      casual: "Generate 5 casual, friendly social media captions",
      professional: "Generate 5 professional, business-appropriate captions",
      funny: "Generate 5 funny, humorous captions with wordplay or jokes",
      inspirational: "Generate 5 inspirational, motivational captions",
      minimal: "Generate 5 minimal, short and concise captions (under 10 words each)",
      storytelling: "Generate 5 storytelling captions that create a narrative",
    };

    const systemPrompt = `You are a creative social media caption writer. ${stylePrompts[style] || stylePrompts.casual}. 
    
Each caption should:
- Be engaging and suited for the image
- Include relevant emojis where appropriate
- Be ready to post on social media
- Vary in length and approach

Format your response as a JSON array of caption strings only, nothing else.
Example: ["Caption 1 here 🎨", "Caption 2 here ✨", "Caption 3 here 💫", "Caption 4 here 🌟", "Caption 5 here 🎯"]`;

    const userPrompt = imageUrl 
      ? `Generate captions for this image: ${imageUrl}${description ? `\n\nAdditional context: ${description}` : ''}`
      : `Generate captions based on this description: ${description}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate captions");
    }

    const data = await response.json();
    const captionsText = data.choices[0].message.content;
    
    // Try to parse as JSON array, fallback to splitting by newlines
    let captions: string[];
    try {
      captions = JSON.parse(captionsText);
    } catch {
      captions = captionsText
        .split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
        .filter((caption: string) => caption.length > 0);
    }

    return new Response(
      JSON.stringify({ captions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-caption function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
