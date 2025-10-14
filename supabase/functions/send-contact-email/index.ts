import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Validate and sanitize input
const validateInput = (data: ContactEmailRequest): { valid: boolean; error?: string } => {
  if (!data.name || data.name.trim().length === 0 || data.name.length > 100) {
    return { valid: false, error: "Invalid name" };
  }
  if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || data.email.length > 255) {
    return { valid: false, error: "Invalid email" };
  }
  if (!data.subject || data.subject.trim().length === 0 || data.subject.length > 200) {
    return { valid: false, error: "Invalid subject" };
  }
  if (!data.message || data.message.trim().length === 0 || data.message.length > 2000) {
    return { valid: false, error: "Invalid message" };
  }
  return { valid: true };
};

// Escape HTML special characters to prevent XSS
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();
    
    // Rate limiting check
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Use email as identifier for rate limiting
    const identifier = email.toLowerCase().trim();
    
    // Check rate limit (max 3 submissions per hour per email)
    const { data: existingLimit } = await supabase
      .from('contact_rate_limit')
      .select('*')
      .eq('identifier', identifier)
      .gte('last_submission', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .single();
    
    if (existingLimit && existingLimit.submission_count >= 3) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Update or insert rate limit record
    if (existingLimit) {
      await supabase
        .from('contact_rate_limit')
        .update({ 
          submission_count: existingLimit.submission_count + 1,
          last_submission: new Date().toISOString()
        })
        .eq('id', existingLimit.id);
    } else {
      await supabase
        .from('contact_rate_limit')
        .insert({ identifier, submission_count: 1 });
    }

    // Validate inputs
    const validation = validateInput({ name, email, subject, message });
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending contact email from:", email);

    // Sanitize inputs for email content
    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeSubject = escapeHtml(subject.trim());
    const safeMessage = escapeHtml(message.trim()).replace(/\n/g, '<br>');

    // Send notification to your support email using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ToolMaster Pro <onboarding@resend.dev>",
        to: ["tzaman208@gmail.com"],
        subject: `Contact Form: ${safeSubject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        `,
      }),
    });

    const data = await emailResponse.json();
    console.log("Email sent successfully:", data);

    if (!emailResponse.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
