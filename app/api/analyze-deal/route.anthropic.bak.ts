// API Route: app/api/analyze-deal/route.ts
// This is your BACKEND that calls Anthropic API securely

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealDetails, dealRating } = body;

    // Call Anthropic API from backend (secure)
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "", // API key from environment variable
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search"
          }
        ],
        messages: [
          {
            role: "user",
            content: `You are a business acquisition expert. Analyze this deal and provide market intelligence:

**Deal Details:**
- Industry: General Business
- Purchase Price: ${dealDetails.purchasePrice}
- Annual Revenue: ${dealDetails.revenue}
- Annual SDE/EBITDA: ${dealDetails.cashFlow}
- Price/SDE Multiple: ${dealDetails.sdeMultiple}
- Price/Revenue Multiple: ${dealDetails.revenueMultiple}

**Deal Rating:** ${dealRating.grade} (${dealRating.assessment})

Please search the web and provide:

1. **Industry Multiples Benchmark:**
   - Search for current industry valuation multiples
   - Compare this deal's multiples to market standards
   - Is the price fair, high, or low?

2. **Market Trends:**
   - Current trends in business acquisitions
   - Industry-specific market conditions
   - Economic factors affecting valuations

3. **Risk Assessment:**
   - Top 3 risks for this deal
   - Red flags based on the metrics
   - Mitigation strategies

4. **Investment Recommendation:**
   - Overall assessment (Strong Buy/Buy/Hold/Pass)
   - Key strengths and weaknesses
   - Action items for due diligence

Format your response as JSON with these sections: industryMultiples, marketTrends, riskAssessment, recommendation`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract text content from response
    let analysisText = "";
    if (data.content) {
      for (const block of data.content) {
        if (block.type === "text") {
          analysisText += block.text;
        }
      }
    }

    // Try to parse as JSON, or use raw text
    let insights;
    try {
      // Remove markdown code blocks if present
      const cleanText = analysisText.replace(/```json\n?|```\n?/g, "").trim();
      insights = JSON.parse(cleanText);
    } catch {
      // If not JSON, structure the text response
      insights = {
        raw: analysisText,
        industryMultiples: "Analysis in progress...",
        marketTrends: "Analyzing market data...",
        riskAssessment: "Evaluating risks...",
        recommendation: "Generating recommendations..."
      };
    }

    return NextResponse.json({ success: true, insights });

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze deal" },
      { status: 500 }
    );
  }
}
