import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration for AI providers
const LOVABLE_AI_FREE_UNTIL = new Date('2025-10-13');
const PROVIDERS = {
  LOVABLE: 'lovable',
  GOOGLE_AI_STUDIO: 'google-ai-studio',
} as const;

type Provider = typeof PROVIDERS[keyof typeof PROVIDERS];

interface AIConfig {
  currentProvider: Provider;
  lastChecked: string;
  lovableStatus: 'free' | 'paid' | 'unknown';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, forceProvider } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or initialize AI configuration
    let config = await getAIConfig(supabase);
    
    // Determine which provider to use
    const provider = forceProvider || await selectProvider(config, supabase);
    console.log(`Using AI provider: ${provider}`);

    let response;
    let success = false;

    // Try primary provider
    try {
      response = await callAIProvider(provider, messages);
      success = true;
      
      // Update config on success
      if (provider === PROVIDERS.LOVABLE) {
        config.lovableStatus = 'free';
      }
    } catch (error: any) {
      console.error(`Error with ${provider}:`, error.message);
      
      // If Lovable AI fails with payment error, mark as paid and switch
      if (provider === PROVIDERS.LOVABLE && (error.status === 402 || error.status === 429)) {
        console.log('Lovable AI no longer free, switching to Google AI Studio');
        config.lovableStatus = 'paid';
        config.currentProvider = PROVIDERS.GOOGLE_AI_STUDIO;
        await saveAIConfig(supabase, config);
        
        // Retry with fallback provider
        response = await callAIProvider(PROVIDERS.GOOGLE_AI_STUDIO, messages);
        success = true;
      } else if (provider === PROVIDERS.GOOGLE_AI_STUDIO) {
        // If Google AI Studio fails, try Lovable as fallback
        try {
          console.log('Google AI Studio failed, trying Lovable AI as fallback');
          response = await callAIProvider(PROVIDERS.LOVABLE, messages);
          success = true;
          config.lovableStatus = 'free';
          config.currentProvider = PROVIDERS.LOVABLE;
          await saveAIConfig(supabase, config);
        } catch (lovableError: any) {
          throw error; // Throw original error if fallback also fails
        }
      } else {
        throw error;
      }
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
        details: 'All AI providers failed. Please try again later.'
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
      currentProvider: PROVIDERS.LOVABLE,
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

async function selectProvider(config: AIConfig, supabase: any): Promise<Provider> {
  const now = new Date();
  const lastChecked = new Date(config.lastChecked);
  const hoursSinceLastCheck = (now.getTime() - lastChecked.getTime()) / (1000 * 60 * 60);

  // Check if we should re-test Lovable AI (every 24 hours)
  if (hoursSinceLastCheck >= 24 && config.lovableStatus === 'paid') {
    console.log('Re-testing Lovable AI availability (24h periodic check)');
    // selectProvider will be called again after test, so return current provider
    return PROVIDERS.LOVABLE; // This will trigger a test
  }

  // If before free date and status is not explicitly 'paid', use Lovable
  if (now < LOVABLE_AI_FREE_UNTIL && config.lovableStatus !== 'paid') {
    return PROVIDERS.LOVABLE;
  }

  // If after free date but status is 'free' (meaning it was extended), use Lovable
  if (config.lovableStatus === 'free') {
    return PROVIDERS.LOVABLE;
  }

  // Otherwise use Google AI Studio
  return PROVIDERS.GOOGLE_AI_STUDIO;
}

async function callAIProvider(provider: Provider, messages: any[]): Promise<Response> {
  if (provider === PROVIDERS.LOVABLE) {
    return await callLovableAI(messages);
  } else if (provider === PROVIDERS.GOOGLE_AI_STUDIO) {
    return await callGoogleAIStudio(messages);
  }
  throw new Error('Unknown provider');
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

async function callGoogleAIStudio(messages: any[]): Promise<Response> {
  const GOOGLE_AI_KEY = Deno.env.get('GOOGLE_AI_STUDIO_KEY');
  if (!GOOGLE_AI_KEY) {
    throw new Error('GOOGLE_AI_STUDIO_KEY not configured');
  }

  // Convert OpenAI-style messages to Gemini format
  const contents = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

  const systemInstruction = messages.find(msg => msg.role === 'system')?.content || 
    'You are a helpful AI assistant for ToolMaster Pro.';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?key=${GOOGLE_AI_KEY}&alt=sse`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Google AI Studio error:', response.status, errorData);
    const error: any = new Error('Google AI Studio request failed');
    error.status = response.status;
    throw error;
  }

  // Transform Gemini SSE format to OpenAI format
  const transformedStream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');


          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6);
                const data = JSON.parse(jsonStr);
                
                // Extract text from Gemini response
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  // Convert to OpenAI SSE format
                  const openAIFormat = {
                    choices: [{
                      delta: { content: text },
                      index: 0
                    }]
                  };
                  
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify(openAIFormat)}\n\n`)
                  );
                }
              } catch (e) {
                console.error('Error parsing Gemini response:', e);
              }
            }
          }
        }
        
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(transformedStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
