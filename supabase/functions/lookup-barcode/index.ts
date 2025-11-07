import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { barcode } = await req.json();

    if (!barcode) {
      return new Response(
        JSON.stringify({ error: 'Barcode is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Try Open Food Facts first (best for food products worldwide)
    try {
      const foodResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
        headers: {
          'User-Agent': 'ToolMasterPro/1.0 (Barcode Scanner)'
        }
      });
      const foodData = await foodResponse.json();

      if (foodData.status === 1 && foodData.product && foodData.product.product_name) {
        return new Response(
          JSON.stringify({
            source: "Open Food Facts",
            name: foodData.product.product_name || "Unknown",
            brand: foodData.product.brands || "Unknown",
            categories: foodData.product.categories || "Unknown",
            image: foodData.product.image_url || foodData.product.image_front_url,
            ingredients: foodData.product.ingredients_text,
            nutrition: {
              energy: foodData.product.nutriments?.energy_value,
              fat: foodData.product.nutriments?.fat,
              carbohydrates: foodData.product.nutriments?.carbohydrates,
              proteins: foodData.product.nutriments?.proteins,
            },
            labels: foodData.product.labels,
            packaging: foodData.product.packaging,
            countries: foodData.product.countries,
            barcode: barcode,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error("Open Food Facts error:", error);
    }

    // Try UPC Database
    try {
      const upcResponse = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, {
        headers: {
          'User-Agent': 'ToolMasterPro/1.0 (Barcode Scanner)'
        }
      });
      const upcData = await upcResponse.json();

      if (upcData.items && upcData.items.length > 0) {
        const item = upcData.items[0];
        return new Response(
          JSON.stringify({
            source: "UPC Database",
            name: item.title || "Unknown",
            brand: item.brand || "Unknown",
            description: item.description,
            category: item.category,
            image: item.images?.[0],
            price: item.offers?.[0]?.price,
            currency: item.offers?.[0]?.currency,
            merchant: item.offers?.[0]?.merchant,
            barcode: barcode,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error("UPC Database error:", error);
    }

    // Try Barcode Lookup API
    try {
      const barcodeResponse = await fetch(`https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=YOUR_API_KEY`);
      const barcodeData = await barcodeResponse.json();
      
      if (barcodeData.products && barcodeData.products.length > 0) {
        const product = barcodeData.products[0];
        return new Response(
          JSON.stringify({
            source: "Barcode Lookup",
            name: product.title || product.product_name,
            brand: product.brand || product.manufacturer,
            description: product.description,
            category: product.category,
            image: product.images?.[0],
            price: product.stores?.[0]?.price,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error("Barcode Lookup error:", error);
    }

    // Try Open Product Data
    try {
      const opdResponse = await fetch(`https://openproductdata.com/api/v1/products/${barcode}`, {
        headers: {
          'User-Agent': 'ToolMasterPro/1.0 (Barcode Scanner)'
        }
      });
      const opdData = await opdResponse.json();

      if (opdData && opdData.name) {
        return new Response(
          JSON.stringify({
            source: "Open Product Data",
            name: opdData.name,
            brand: opdData.brand,
            description: opdData.description,
            category: opdData.category,
            image: opdData.image_url,
            barcode: barcode,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error("Open Product Data error:", error);
    }

    // No product found in any database
    return new Response(
      JSON.stringify({
        source: "Not Found",
        barcode: barcode,
        message: `No product information found for barcode: ${barcode}`,
        suggestion: "This barcode might be:\n• A regional or local product not in international databases\n• A newly released product\n• A private label or store brand\n• A non-retail barcode (internal use)\n\nYou can try:\n• Searching the barcode number on Google\n• Checking the manufacturer's website\n• Looking for product information on the packaging",
        searchUrl: `https://www.google.com/search?q=${barcode}+barcode`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
