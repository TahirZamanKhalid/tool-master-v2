import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration for AI providers
const LOVABLE_AI_FREE_UNTIL = new Date('2025-10-13');

interface AIConfig {
  lastChecked: string;
  lovableStatus: 'free' | 'paid' | 'unknown';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or initialize AI configuration
    let config = await getAIConfig(supabase);
    
    console.log('Using Lovable AI');

    let response;

    try {
      response = await callLovableAI(messages);
      config.lovableStatus = 'free';
    } catch (error: any) {
      console.error('Lovable AI error:', error.message);
      
      // If payment required or rate limited
      if (error.status === 402) {
        config.lovableStatus = 'paid';
        throw new Error('Lovable AI credits exhausted. Please add credits to continue.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw error;
    }

    // Update last checked timestamp
    config.lastChecked = new Date().toISOString();
    await saveAIConfig(supabase, config);

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error: any) {
    console.error('Smart AI Chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'AI service error',
        details: error.message || 'AI service temporarily unavailable. Please try again later.'
      }), 
      {
        status: error.status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function getAIConfig(supabase: any): Promise<AIConfig> {
  const { data, error } = await supabase
    .from('ai_config')
    .select('*')
    .single();

  if (error || !data) {
    // Initialize default config
    const defaultConfig: AIConfig = {
      lastChecked: new Date().toISOString(),
      lovableStatus: 'unknown',
    };
    
    await supabase
      .from('ai_config')
      .insert(defaultConfig);
    
    return defaultConfig;
  }

  return data as AIConfig;
}

async function saveAIConfig(supabase: any, config: AIConfig) {
  await supabase
    .from('ai_config')
    .upsert(config);
}


async function callLovableAI(messages: any[]): Promise<Response> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

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
          content: 'You are a helpful AI assistant for ToolMaster Pro. Provide clear, concise, and accurate responses.' 
        },
        ...messages
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Lovable AI error response:', response.status, errorData);
    const error: any = new Error('Lovable AI request failed');
    error.status = response.status;
    throw error;
  }

  return response;
}
