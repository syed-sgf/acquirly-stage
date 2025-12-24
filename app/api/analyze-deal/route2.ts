// API Route: app/api/analyze-deal/route.ts
// Multi-Provider AI Analysis (OpenAI + Anthropic)
// Users can use default (OpenAI) or bring their own API key

import { NextRequest, NextResponse } from 'next/server';

// Rate limiter
const requestTimes: number[] = [];
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(): boolean {
  const now = Date.now();
  while (requestTimes.length > 0 && requestTimes[0] < now - RATE_LIMIT_WINDOW) {
    requestTimes.shift();
  }
  if (requestTimes.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  requestTimes.push(now);
  return true;
}

// OpenAI Analysis (Default - Free $5 credit for new accounts)
async function analyzeWithOpenAI(dealDetails: any, dealRating: any, userApiKey?: string) {
  const apiKey = userApiKey || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o", // Fast and smart
      messages: [
        {
          role: "system",
          content: "You are an expert business acquisition analyst. Provide market intelligence with real data and actionable insights."
        },
        {
          role: "user",
          content: `Analyze this business acquisition deal:

**Deal Details:**
- Purchase Price: ${dealDetails.purchasePrice}
- Annual Revenue: ${dealDetails.revenue}
- Annual SDE/EBITDA: ${dealDetails.cashFlow}
- Price/SDE Multiple: ${dealDetails.sdeMultiple}x
- Price/Revenue Multiple: ${dealDetails.revenueMultiple}x
- Deal Rating: ${dealRating.grade} (${dealRating.assessment})

Provide a comprehensive market intelligence report with:

1. **Industry Valuation Benchmarks:**
   - Current industry multiples for similar businesses
   - How this deal compares to market standards
   - Price assessment (fair/high/low)

2. **Market Trends:**
   - Current business acquisition trends
   - Industry-specific market conditions
   - Economic factors affecting valuations

3. **Risk Assessment:**
   - Top 3-5 risks for this specific deal
   - Red flags based on the metrics
   - Mitigation strategies

4. **Investment Recommendation:**
   - Overall assessment (Strong Buy/Buy/Hold/Pass)
   - Key strengths and weaknesses
   - Due diligence action items

Format as JSON with keys: industryMultiples, marketTrends, riskAssessment, recommendation`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "";
  
  // Try to parse JSON
  try {
    const cleanContent = content.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(cleanContent);
  } catch {
    return { raw: content };
  }
}

// Anthropic Analysis (Alternative)
async function analyzeWithAnthropic(dealDetails: any, dealRating: any, userApiKey?: string) {
  const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error("Anthropic API key not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `Analyze this business acquisition deal:

**Deal Details:**
- Purchase Price: ${dealDetails.purchasePrice}
- Annual Revenue: ${dealDetails.revenue}
- Annual SDE/EBITDA: ${dealDetails.cashFlow}
- Price/SDE Multiple: ${dealDetails.sdeMultiple}x
- Price/Revenue Multiple: ${dealDetails.revenueMultiple}x
- Deal Rating: ${dealRating.grade} (${dealRating.assessment})

Provide: industryMultiples, marketTrends, riskAssessment, recommendation as JSON.`
      }]
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Anthropic error: ${response.status}`);
  }

  const data = await response.json();
  let content = "";
  if (data.content) {
    for (const block of data.content) {
      if (block.type === "text") content += block.text;
    }
  }

  try {
    const cleanContent = content.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(cleanContent);
  } catch {
    return { raw: content };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    if (!checkRateLimit()) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { dealDetails, dealRating, provider = "openai", userApiKey } = body;

    if (!dealDetails || !dealRating) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Choose AI provider
    let insights;
    if (provider === "anthropic") {
      insights = await analyzeWithAnthropic(dealDetails, dealRating, userApiKey);
    } else {
      // Default to OpenAI (better rate limits, cheaper)
      insights = await analyzeWithOpenAI(dealDetails, dealRating, userApiKey);
    }

    return NextResponse.json({ 
      success: true, 
      insights,
      provider: provider === "anthropic" ? "Claude (Anthropic)" : "GPT-4o (OpenAI)"
    });

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    
    let errorMessage = "Failed to analyze deal. Please try again.";
    
    if (error.message.includes("429") || error.message.includes("Rate limit")) {
      errorMessage = "⏱️ Rate limit reached. Please wait 1-2 minutes or add your own API key.";
    } else if (error.message.includes("API key")) {
      errorMessage = "🔑 API key issue. Please check configuration or add your own key.";
    } else if (error.message.includes("quota")) {
      errorMessage = "💳 API quota exceeded. Please add your own API key in settings.";
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
