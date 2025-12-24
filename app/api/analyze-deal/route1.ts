// API Route: app/api/analyze-deal/route.ts
// Backend route that calls OpenAI securely using OPENAI_API_KEY from .env.local

import { NextRequest, NextResponse } from "next/server";

type DealDetails = {
  purchasePrice?: number | string | null;
  revenue?: number | string | null;
  cashFlow?: number | string | null;
  sdeMultiple?: number | string | null;
  revenueMultiple?: number | string | null;
};

type DealRating = {
  grade?: string;
  assessment?: string;
  score?: number;
  factors?: Record<string, unknown>;
};

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing OPENAI_API_KEY in environment." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const dealDetails: DealDetails = body?.dealDetails ?? {};
    const dealRating: DealRating = body?.dealRating ?? {};

    // Normalize / guard values
    const purchasePrice = toNumberOrNull(dealDetails.purchasePrice);
    const annualRevenue = toNumberOrNull(dealDetails.revenue);
    const annualCashFlow = toNumberOrNull(dealDetails.cashFlow);

    // Guard divide-by-zero before sending (prevents Infinity/NaN downstream)
    const sdeMultiple =
      purchasePrice && annualCashFlow && annualCashFlow !== 0
        ? Number((purchasePrice / annualCashFlow).toFixed(2))
        : toNumberOrNull(dealDetails.sdeMultiple);

    const revenueMultiple =
      purchasePrice && annualRevenue && annualRevenue !== 0
        ? Number((purchasePrice / annualRevenue).toFixed(2))
        : toNumberOrNull(dealDetails.revenueMultiple);

    const model =
      process.env.OPENAI_MODEL ||
      process.env.NEXT_PUBLIC_OPENAI_MODEL ||
      "gpt-4.1-mini";

    const system = `You are a business acquisition underwriting and valuation analyst.
Return ONLY valid JSON (no markdown, no commentary). If you are unsure, state assumptions explicitly.
Do not fabricate citations or claim you performed live web searches.`;

    const user = `Analyze this acquisition deal and provide market intelligence.

Deal Details:
- Industry: General Business
- Purchase Price: ${purchasePrice ?? "N/A"}
- Annual Revenue: ${annualRevenue ?? "N/A"}
- Annual SDE/EBITDA: ${annualCashFlow ?? "N/A"}
- Price/SDE Multiple: ${sdeMultiple ?? "N/A"}
- Price/Revenue Multiple: ${revenueMultiple ?? "N/A"}

Deal Rating:
- Grade: ${dealRating.grade ?? "N/A"}
- Assessment: ${dealRating.assessment ?? "N/A"}

Return JSON with exactly these top-level keys:
{
  "industryMultiples": {
    "typicalSdeMultipleRange": "string",
    "typicalRevenueMultipleRange": "string",
    "comparisonToMarket": "string",
    "notes": "string"
  },
  "marketTrends": {
    "summary": "string",
    "tailwinds": ["string"],
    "headwinds": ["string"]
  },
  "riskAssessment": {
    "keyRisks": ["string"],
    "mitigants": ["string"],
    "diligenceChecklist": ["string"]
  },
  "recommendation": {
    "verdict": "string",
    "pricingAdvice": "string",
    "structureIdeas": ["string"],
    "nextSteps": ["string"]
  }
}`;

    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.3,
        // Strongly encourages strict JSON in supported models
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResp.ok) {
      const errText = await openaiResp.text().catch(() => "");
      return NextResponse.json(
        {
          success: false,
          error: `OpenAI API error: ${openaiResp.status}`,
          details: errText?.slice(0, 1000) || undefined,
        },
        { status: openaiResp.status }
      );
    }

    const data = await openaiResp.json();

    const content: string | undefined =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.message?.content?.[0]?.text;

    let insights: any;
    try {
      insights = content ? JSON.parse(content) : null;
    } catch {
      // Last-resort fallback (should be rare if response_format works)
      insights = {
        industryMultiples: {
          typicalSdeMultipleRange: "N/A",
          typicalRevenueMultipleRange: "N/A",
          comparisonToMarket: "Unable to parse model output as JSON.",
          notes: content || "No content returned.",
        },
        marketTrends: { summary: "N/A", tailwinds: [], headwinds: [] },
        riskAssessment: { keyRisks: [], mitigants: [], diligenceChecklist: [] },
        recommendation: { verdict: "N/A", pricingAdvice: "N/A", structureIdeas: [], nextSteps: [] },
      };
    }

    return NextResponse.json({ success: true, insights });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to analyze deal" },
      { status: 500 }
    );
  }
}
