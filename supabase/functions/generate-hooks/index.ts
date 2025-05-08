import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Use the new API key directly
const openAIApiKey = import.meta.env.VITE_OPENAI_API_KEY;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, platform, tone } = await req.json();

    const systemPrompt = `You are a viral content strategist who helps creators write high-converting hook lines. Generate 5 diverse hooks for the given topic.

Rules:
1. Each hook must be under 20 words
2. Use curiosity, emotional contrast, storytelling, or surprise
3. Avoid clichés and generic hooks
4. Vary formats across the 5 hooks:
   - Bold statement
   - Relatable insight
   - Contrarian opinion
   - Personal story teaser
   - Open-ended question
5. Never repeat phrases
6. Adapt to the platform style (${platform}) and tone (${tone})
7. Make it feel human and authentic`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate 5 hooks for topic: ${topic}. Platform: ${platform}. Tone: ${tone}`,
          },
        ],
        temperature: 0.9,
      }),
    });

    const data = await response.json();
    let hooks = data.choices[0].message.content
      .split("\n")
      .filter((line) => line.trim())
      .map((hook) => hook.replace(/^\d+\.\s*/, "").trim())
      .slice(0, 5);

    return new Response(JSON.stringify({ hooks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
