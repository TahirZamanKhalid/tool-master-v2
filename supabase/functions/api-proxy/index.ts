import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, *',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS',
};

// SECURITY: URL allowlist for approved domains only
const ALLOWED_DOMAINS = [
  'api.exchangerate-api.com',
  'api.openexchangerates.org',
  'api.currencyapi.com',
  'ipapi.co',
  'ipinfo.io',
  'api.ipify.org',
  'api.frankfurter.app',
  'ip-api.com',  // For IP lookup
  'ajk.pakdhis2.org',  // DHIS2 API
];

// SECURITY: Validate URL to prevent SSRF attacks
const validateUrl = (urlString: string): { valid: boolean; error?: string } => {
  try {
    const parsedUrl = new URL(urlString);
    
    // Block non-HTTP protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS protocols allowed' };
    }
    
    // Check against allowlist
    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    if (!isAllowed) {
      return { valid: false, error: 'Domain not in allowlist' };
    }
    
    // Block private IP ranges (RFC 1918)
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(hostname)) {
      const parts = hostname.split('.').map(Number);
      // Block 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16
      if (
        parts[0] === 10 ||
        parts[0] === 127 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        (parts[0] === 169 && parts[1] === 254)
      ) {
        return { valid: false, error: 'Private IP addresses blocked' };
      }
    }
    
    // Block localhost
    if (hostname === 'localhost' || hostname === '0.0.0.0') {
      return { valid: false, error: 'Localhost blocked' };
    }
    
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, method, headers, body } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Validate URL for security
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      console.error('URL validation failed:', urlValidation.error, 'URL:', url);
      return new Response(
        JSON.stringify({ error: urlValidation.error }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: method || 'GET',
      headers: headers || {},
    };

    // Add body for methods that support it
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      fetchOptions.body = body;
    }

    // Make the proxied request
    const startTime = Date.now();
    const response = await fetch(url, fetchOptions);
    const endTime = Date.now();

    // Get response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Try to parse response as JSON, fallback to text
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Return the proxied response
    return new Response(
      JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        time: endTime - startTime,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch from target URL';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
