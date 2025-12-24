// ENHANCED API Route with Industry-Specific Analysis
// app/api/analyze-deal/route.ts

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

// ENHANCED OpenAI Analysis with Industry-Specific Intelligence
async function analyzeWithOpenAI(dealDetails: any, dealRating: any, userApiKey?: string) {
  const apiKey = userApiKey || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  // Build comprehensive prompt with industry context
  const prompt = `You are an elite M&A advisor and business acquisition expert. Analyze this ${dealDetails.industry || 'business'} acquisition deal in extreme detail.

**DEAL OVERVIEW:**
- Industry/Sector: ${dealDetails.industry || 'Not specified'}
- Purchase Price: $${dealDetails.purchasePrice?.toLocaleString()}
- Annual Revenue: $${dealDetails.revenue?.toLocaleString()}
- Annual Cash Flow (SDE/EBITDA): $${dealDetails.cashFlow?.toLocaleString()}
- Price/SDE Multiple: ${dealDetails.sdeMultiple}x
- Price/Revenue Multiple: ${dealDetails.revenueMultiple}x
- Deal Quality Rating: ${dealRating.grade} (${dealRating.assessment})

**YOUR MISSION:**
Provide an exceptionally detailed, industry-specific market intelligence report that a sophisticated investor would pay $5,000+ for. Be specific, actionable, and data-driven.

**REQUIRED ANALYSIS SECTIONS:**

1. **INDUSTRY VALUATION BENCHMARKS** (Be highly specific to ${dealDetails.industry || 'this industry'}):
   - Current market multiples for ${dealDetails.industry || 'this industry'} (provide specific ranges)
   - How this deal compares to recent transactions
   - Why multiples are trending up/down in this sector
   - Geographic considerations (if applicable)
   - Size-based valuation adjustments
   - Quality premium/discount factors
   
2. **MARKET TRENDS & INTELLIGENCE** (Deep dive):
   - Current M&A activity in ${dealDetails.industry || 'this sector'}
   - Buyer demand levels (strategic vs. financial buyers)
   - Industry consolidation trends
   - Technology disruption factors
   - Regulatory environment changes
   - Consumer behavior shifts affecting the sector
   - Post-pandemic impacts
   - Interest rate environment effects
   
3. **COMPETITIVE ANALYSIS**:
   - Competitive intensity in ${dealDetails.industry || 'this industry'}
   - Barriers to entry/exit
   - Key success factors
   - Market positioning strategies
   - Differentiation opportunities
   - Competitive threats to watch
   
4. **GROWTH OPPORTUNITIES** (Be creative and specific):
   - Top 5 revenue growth strategies for this business
   - Operational efficiency improvements
   - Technology integration opportunities
   - Market expansion possibilities
   - Product/service line extensions
   - Strategic partnership potential
   
5. **RISK ASSESSMENT** (Comprehensive):
   - Industry-specific risks
   - Economic sensitivity analysis
   - Key person dependencies
   - Customer concentration risks
   - Supplier relationship risks
   - Technology/obsolescence risks
   - Regulatory compliance risks
   - Integration/transition risks
   - Financial structure risks
   - Mitigation strategies for each
   
6. **INVESTMENT RECOMMENDATION**:
   - Clear Buy/Hold/Pass recommendation with rationale
   - Optimal deal structure suggestions
   - Negotiation leverage points
   - Price adjustment justifications (if any)
   - Critical success factors
   - First 100 days action plan
   - Key performance indicators to track
   - Exit strategy considerations (3-7 year horizon)
   
7. **DUE DILIGENCE PRIORITIES**:
   - Top 10 due diligence items specific to ${dealDetails.industry || 'this industry'}
   - Financial statement deep dives needed
   - Operational assessments required
   - Legal/compliance reviews
   - Customer/supplier interviews
   - Technology/systems audits
   - Market validation steps

**OUTPUT FORMAT:**
Return a detailed JSON object with these keys:
{
  "industryMultiples": {
    "currentRange": "string",
    "dealComparison": "string",
    "trendAnalysis": "string",
    "geographic": "string"
  },
  "marketTrends": {
    "maActivity": "string",
    "buyerDemand": "string",
    "consolidation": "string",
    "disruption": "string",
    "regulations": "string"
  },
  "competitive": {
    "intensity": "string",
    "barriers": "string",
    "positioning": "string",
    "threats": "string"
  },
  "growthOpportunities": [
    "opportunity 1 with specific details",
    "opportunity 2 with specific details",
    "opportunity 3 with specific details",
    "opportunity 4 with specific details",
    "opportunity 5 with specific details"
  ],
  "riskAssessment": {
    "industryRisks": ["risk 1", "risk 2", "risk 3"],
    "operationalRisks": ["risk 1", "risk 2"],
    "financialRisks": ["risk 1", "risk 2"],
    "mitigationStrategies": ["strategy 1", "strategy 2", "strategy 3"]
  },
  "recommendation": {
    "verdict": "Strong Buy | Buy | Hold | Pass",
    "rationale": "detailed explanation",
    "keyStrengths": ["strength 1", "strength 2", "strength 3"],
    "keyWeaknesses": ["weakness 1", "weakness 2"],
    "dealStructure": "optimal structure suggestions",
    "negotiationPoints": ["point 1", "point 2"],
    "first100Days": ["action 1", "action 2", "action 3"],
    "exitStrategy": "string"
  },
  "dueDiligence": {
    "financial": ["item 1", "item 2", "item 3"],
    "operational": ["item 1", "item 2"],
    "legal": ["item 1", "item 2"],
    "market": ["item 1", "item 2"]
  }
}

**CRITICAL INSTRUCTIONS:**
- Be SPECIFIC to ${dealDetails.industry || 'the industry'} - use industry terminology
- Provide ACTIONABLE insights, not generic advice
- Include NUMBERS and DATA wherever possible
- Think like a $10M+ deal advisor
- Be BOLD in your recommendations
- Cite specific market trends from 2024-2025`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a world-class M&A advisor with deep expertise across all industries. You provide million-dollar insights and actionable intelligence. Be specific, data-driven, and bold in your analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8, // Slightly higher for more creative insights
      max_tokens: 4000   // Doubled for comprehensive analysis
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "";
  
  try {
    const cleanContent = content.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(cleanContent);
  } catch {
    return { raw: content };
  }
}

// ENHANCED Anthropic Analysis
async function analyzeWithAnthropic(dealDetails: any, dealRating: any, userApiKey?: string) {
  const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error("Anthropic API key not configured");
  }

  const prompt = `Analyze this ${dealDetails.industry || 'business'} acquisition deal with exceptional detail and industry-specific insights.

Deal: $${dealDetails.purchasePrice?.toLocaleString()} purchase
Industry: ${dealDetails.industry || 'Not specified'}
Revenue: $${dealDetails.revenue?.toLocaleString()}
Cash Flow: $${dealDetails.cashFlow?.toLocaleString()}
Price/SDE: ${dealDetails.sdeMultiple}x
Rating: ${dealRating.grade}

Provide comprehensive JSON analysis covering: industryMultiples, marketTrends, competitive, growthOpportunities, riskAssessment, recommendation, dueDiligence.

Be SPECIFIC to ${dealDetails.industry || 'the industry'}. Include actionable insights and data.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: prompt
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

    let insights;
    if (provider === "anthropic") {
      insights = await analyzeWithAnthropic(dealDetails, dealRating, userApiKey);
    } else {
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
