"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { computePro, type ProInputs, formatPercent } from "@/lib/pro-logic";
import { fmtUSD, fmtMult, fmtDSCR } from "@/lib/num";
import LegendModal from "@/components/LegendModal";
import Tooltip, { InfoIcon } from "@/components/Tooltip";
import CashFlowWaterfall from "@/components/pro/CashFlowWaterfall";
import { getFieldDefinition } from "@/lib/field-definitions";

// Local extension: ProInputs.deal (DealAssumptions) does not currently include `industry`,
// but we want to capture it for AI benchmarking without changing core math logic.
type ProInputsExt = Omit<ProInputs, "deal"> & {
  deal: ProInputs["deal"] & { industry?: string };
};

type DealRating = { grade: string; assessment: string };
type AIProvider = "openai" | "anthropic";

// AI Market Intelligence Component

function AIMarketIntelligence({
  inputs,
  dealRating,
}: {
  inputs: ProInputsExt;
  dealRating: DealRating;
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  
  const abortRef = useRef<AbortController | null>(null);
  
// AI Provider settings
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [useOwnKey, setUseOwnKey] = useState(false);

  const safeMultiple = (num: number, den: number) => {
    if (!den || den <= 0 || !isFinite(num) || !isFinite(den)) return null;
    const v = num / den;
    return isFinite(v) ? v.toFixed(2) : null;
  };

const analyzeMarket = async () => {
    // Check cooldown
    const now = Date.now();
    if (now < cooldownUntil) {
      const secondsLeft = Math.ceil((cooldownUntil - now) / 1000);
      setError(`⏱️ Please wait ${secondsLeft} seconds before trying again.`);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Cancel any in-flight request before starting a new one
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const sdeMultiple = safeMultiple(inputs.deal.askingOrOfferPrice, inputs.deal.annualCashFlow);
      const revenueMultiple = safeMultiple(inputs.deal.askingOrOfferPrice, inputs.deal.annualRevenue);

      const response = await fetch("/api/analyze-deal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          dealDetails: {
            purchasePrice: inputs.deal.askingOrOfferPrice,
            revenue: inputs.deal.annualRevenue,
            cashFlow: inputs.deal.annualCashFlow,
            industry: inputs.deal.industry || "General Business",
            sdeMultiple: sdeMultiple ?? undefined,
            revenueMultiple: revenueMultiple ?? undefined
          },
          dealRating: {
            grade: dealRating.grade,
            assessment: dealRating.assessment
          },
          provider: provider,
          userApiKey: useOwnKey ? apiKey : undefined
        })
      });

      const data = await response.json();

      if (response.status === 429) {
        setError("⏱️ Rate limit reached. Try adding your own API key in settings.");
        setCooldownUntil(Date.now() + 180000);
        return;
      }

      if (!data.success) {
        if (data.error.includes("quota") || data.error.includes("Rate limit")) {
          setError("💳 " + data.error + " Add your own API key to continue.");
          setShowSettings(true); // Auto-open settings
        } else {
          setError(data.error || "❌ Analysis failed.");
        }
        return;
      }

      setAiInsights(data.insights);
      setError(null);

    } catch (err: any) {
      if (err?.name === "AbortError") {
        // Silent abort (user triggered a new request or navigated away)
      } else {
        console.error("AI Analysis Error:", err);
        setError("❌ Network error. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
      abortRef.current = null;
    }
  };

  const inCooldown = Date.now() < cooldownUntil;
  const cooldownSeconds = inCooldown ? Math.ceil((cooldownUntil - Date.now()) / 1000) : 0;

  // Helper function to render AI insights (handles strings, objects, and arrays recursively)
  const renderInsight = (data: any): React.ReactNode => {
    if (!data) return null;
    
    // If it's a string, render directly
    if (typeof data === 'string') {
      return <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{data}</div>;
    }
    
    // If it's an array, render as bulleted list
    if (Array.isArray(data)) {
      return (
        <ul className="list-none space-y-2 ml-0">
          {data.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-green-600 mt-1 flex-shrink-0">•</span>
              <div className="text-sm text-gray-700 flex-1">
                {typeof item === 'string' ? item : renderInsight(item)}
              </div>
            </li>
          ))}
        </ul>
      );
    }
    
    // If it's an object, render each key-value pair
    if (typeof data === 'object') {
      return (
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <div className="font-semibold text-gray-800 mb-2 text-base">
                {key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim()}:
              </div>
              <div className="ml-4">
                {renderInsight(value)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    // Fallback: convert to string
    return <div className="text-sm text-gray-700">{String(data)}</div>;
  };

  // Settings Modal
  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">AI Settings</h3>
          <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Provider Selection */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            AI Provider
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setProvider("openai")}
              className={`p-4 rounded-lg border-2 transition-all ${
                provider === "openai"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-bold text-gray-800">OpenAI</div>
              <div className="text-xs text-gray-600">GPT-4o</div>
              <div className="text-xs text-green-600 mt-1">✓ Default</div>
            </button>
            <button
              onClick={() => setProvider("anthropic")}
              className={`p-4 rounded-lg border-2 transition-all ${
                provider === "anthropic"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-bold text-gray-800">Anthropic</div>
              <div className="text-xs text-gray-600">Claude Sonnet 4</div>
            </button>
          </div>
        </div>

        {/* API Key Input */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={useOwnKey}
              onChange={(e) => setUseOwnKey(e.target.checked)}
              className="rounded"
            />
            Use My Own API Key (Optional)
          </label>
          {useOwnKey && (
            <div className="space-y-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${provider === "openai" ? "OpenAI" : "Anthropic"} API key`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-500">
                💡 Your API key is stored locally. If enabled, it is sent to our server only to proxy this analysis request and is not stored.
              </div>
              <a
                href={provider === "openai" 
                  ? "https://platform.openai.com/api-keys"
                  : "https://console.anthropic.com/settings/keys"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline block"
              >
                Get your {provider === "openai" ? "OpenAI" : "Anthropic"} API key →
              </a>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="text-xs text-blue-800">
            <strong>💡 Why use your own API key?</strong>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>No rate limits</li>
              <li>Pay only for what you use (~$0.006 per analysis)</li>
              <li>Unlimited analyses</li>
              <li>Privacy - your data stays with you</li>
            </ul>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => {
            setShowSettings(false);
            // Save to localStorage
            localStorage.setItem("ai-provider", provider);
            localStorage.setItem("ai-use-own-key", String(useOwnKey));
            if (useOwnKey && apiKey) {
              localStorage.setItem("ai-api-key", apiKey);
            } else {
              localStorage.removeItem("ai-api-key");
            }
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Save Settings
        </button>
      </div>
    </div>
  );

  // Load saved settings
  useEffect(() => {
    const savedProvider = localStorage.getItem("ai-provider");
    const savedKey = localStorage.getItem("ai-api-key");
    const savedUseOwnKey = localStorage.getItem("ai-use-own-key");

    if (savedProvider === "openai" || savedProvider === "anthropic") setProvider(savedProvider);
    if (savedKey) setApiKey(savedKey);
    setUseOwnKey(savedUseOwnKey === "true" && Boolean(savedKey));
  }, []);

  // Abort in-flight request on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  if (!aiInsights) {
    return (
      <>
        {showSettings && <SettingsModal />}
        
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-start gap-3">
            <div className="bg-purple-600 rounded-lg p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  AI Market Intelligence
                  <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                    ✨ Free with {provider === "openai" ? "OpenAI" : "Anthropic"}
                  </span>
                </h4>
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
                  title="AI Settings"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Get AI-powered market analysis with real-time insights
              </p>
              <button
                onClick={analyzeMarket}
                disabled={isAnalyzing || inCooldown}
                className={`${
                  isAnalyzing || inCooldown
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                } text-white font-bold px-6 py-3 rounded-lg shadow-lg transition-all flex items-center gap-2`}
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing with {provider === "openai" ? "GPT-4o" : "Claude"}...
                  </>
                ) : inCooldown ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Wait {cooldownSeconds}s
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate AI Analysis
                  </>
                )}
              </button>
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                  {error.includes("Rate limit") && (
                    <button
                      onClick={() => setShowSettings(true)}
                      className="text-xs text-blue-600 hover:underline mt-1 block"
                    >
                      💡 Add your own API key to remove limits
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Display AI Insights (keep your existing display code)
  return (
    <>
      {showSettings && <SettingsModal />}
      
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-lg flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Market Intelligence Report
              </h4>
              <p className="text-sm text-purple-100">
                Powered by {provider === "openai" ? "GPT-4o (OpenAI)" : "Claude (Anthropic)"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={analyzeMarket}
                disabled={isAnalyzing || inCooldown}
                className={`${
                  isAnalyzing || inCooldown
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-white hover:bg-gray-100 text-purple-600"
                } font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2`}
              >
                <svg className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {inCooldown ? `${cooldownSeconds}s` : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Display insights - keep existing code */}
        {aiInsights.raw && (
          <div className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-sm">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">{aiInsights.raw}</div>
            </div>
          </div>
        )}

        {!aiInsights.raw && (
          <>
            {aiInsights.industryMultiples && (
              <div className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-sm">
                <h5 className="font-bold text-lg text-blue-700 mb-3">📊 Industry Valuation Benchmarks</h5>
                {renderInsight(aiInsights.industryMultiples)}
              </div>
            )}
            {aiInsights.marketTrends && (
              <div className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-sm">
                <h5 className="font-bold text-lg text-green-700 mb-3">📈 Current Market Trends</h5>
                {renderInsight(aiInsights.marketTrends)}
              </div>
            )}
            {aiInsights.competitive && (
              <div className="bg-white rounded-xl p-5 border-2 border-yellow-200 shadow-sm">
                <h5 className="font-bold text-lg text-yellow-700 mb-3">🎯 Competitive Analysis</h5>
                {renderInsight(aiInsights.competitive)}
              </div>
            )}
            {aiInsights.growthOpportunities && (
              <div className="bg-white rounded-xl p-5 border-2 border-emerald-200 shadow-sm">
                <h5 className="font-bold text-lg text-emerald-700 mb-3">🚀 Growth Opportunities</h5>
                {renderInsight(aiInsights.growthOpportunities)}
              </div>
            )}
            {aiInsights.riskAssessment && (
              <div className="bg-white rounded-xl p-5 border-2 border-orange-200 shadow-sm">
                <h5 className="font-bold text-lg text-orange-700 mb-3">⚠️ Risk Assessment</h5>
                {renderInsight(aiInsights.riskAssessment)}
              </div>
            )}
            {aiInsights.dueDiligence && (
              <div className="bg-white rounded-xl p-5 border-2 border-indigo-200 shadow-sm">
                <h5 className="font-bold text-lg text-indigo-700 mb-3">🔍 Due Diligence Priorities</h5>
                {renderInsight(aiInsights.dueDiligence)}
              </div>
            )}
            {aiInsights.recommendation && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 border-2 border-purple-300 shadow-sm">
                <h5 className="font-bold text-lg text-purple-700 mb-3">✅ AI Recommendation</h5>
                {renderInsight(aiInsights.recommendation)}
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-500 text-center italic">
          AI analysis based on current market data. Consult with financial professionals for personalized advice.
        </div>
      </div>
    </>
  );
}


export default function ProPage() {
  const [inputs, setInputs] = useState<ProInputsExt>({
    deal: {
      askingOrOfferPrice: 1500000,
      annualRevenue: 2500000,
      annualCashFlow: 450000,
      industry: "Restaurant",
      ffeValue: 80000,
      ffeIncludedInAsking: "yes",
      inventoryValue: 120000,
      inventoryIncludedInAsking: "no",
      realEstateValue: 900000,
      realEstateIncludedInAsking: "no",
      acquiringRealEstate: "yes",
      annualRentsPaidToOwnerRE: 120000,
    },
    biz: {
      buyersMinimumSalary: 120000,
      workingCapitalRequirement: 100000,
      annualCapexMaintenance: 30000,
      annualCapexNewInvestments: 20000,
    },
    financing: {
      buyerEquity: 300000,
      sellerFinancing: 200000,
      termLoan: 1300000,
      revolvingLOC: 200000,
      closingCosts: 60000,
    },
    lender: {
      interestRateTermLoanAPR: 0.105,
      termYears: 10,
      interestRateLOCAPR: 0.12,
      locUtilizationPct: 0.35,
      usesSDE: true,
    },
  });

  // Broker branding settings (would come from user profile in full version)
  const [brokerBranding, setBrokerBranding] = useState({
    companyName: "Starting Gate Financial",
    brokerName: "Syed Raza",
    phone: "(214) 923-1694",
    email: "info@startinggatefinancial.com",
    logo: null, // Would be uploaded
  });

  const [showBrandingModal, setShowBrandingModal] = useState(false);

  const out = useMemo(() => computePro(inputs as ProInputs), [inputs]);

  // Calculate total CAPEX for waterfall
  const totalCapex = inputs.biz.annualCapexMaintenance + inputs.biz.annualCapexNewInvestments;

  // Check if LOC is being used
  const hasLOC = inputs.financing.revolvingLOC > 0;

  // Calculate Overall Deal Rating
  const calculateDealRating = () => {
    let score = 0;
    let maxScore = 0;
    const factors = [];

    // DSCR Score (30 points max)
    if (out.dscr) {
      maxScore += 30;
      if (out.dscr >= 1.50) {
        score += 30;
        factors.push({ name: "DSCR", score: 30, max: 30, rating: "Excellent" });
      } else if (out.dscr >= 1.35) {
        score += 25;
        factors.push({ name: "DSCR", score: 25, max: 30, rating: "Very Good" });
      } else if (out.dscr >= 1.25) {
        score += 20;
        factors.push({ name: "DSCR", score: 20, max: 30, rating: "Good" });
      } else if (out.dscr >= 1.0) {
        score += 10;
        factors.push({ name: "DSCR", score: 10, max: 30, rating: "Marginal" });
      } else {
        factors.push({ name: "DSCR", score: 0, max: 30, rating: "Poor" });
      }
    }

    // Cash-on-Cash Score (25 points max)
    maxScore += 25;

    if (out.cashOnCashReturn == null) {
      factors.push({ name: "Cash-on-Cash", score: 0, max: 25, rating: "N/A" });
    } else if (out.cashOnCashReturn >= 0.30) {
      score += 25;
      factors.push({ name: "Cash-on-Cash", score: 25, max: 25, rating: "Excellent" });
    } else if (out.cashOnCashReturn >= 0.20) {
      score += 20;
      factors.push({ name: "Cash-on-Cash", score: 20, max: 25, rating: "Very Good" });
    } else if (out.cashOnCashReturn >= 0.15) {
      score += 15;
      factors.push({ name: "Cash-on-Cash", score: 15, max: 25, rating: "Good" });
    } else if (out.cashOnCashReturn >= 0.10) {
      score += 10;
      factors.push({ name: "Cash-on-Cash", score: 10, max: 25, rating: "Fair" });
    } else {
      score += 5;
      factors.push({ name: "Cash-on-Cash", score: 5, max: 25, rating: "Poor" });
    }
    // Leverage Ratio Score (20 points max) - Lower is better
    if (out.leverageRatio) {
      maxScore += 20;
      if (out.leverageRatio <= 2) {
        score += 20;
        factors.push({ name: "Leverage", score: 20, max: 20, rating: "Conservative" });
      } else if (out.leverageRatio <= 3) {
        score += 15;
        factors.push({ name: "Leverage", score: 15, max: 20, rating: "Moderate" });
      } else if (out.leverageRatio <= 5) {
        score += 10;
        factors.push({ name: "Leverage", score: 10, max: 20, rating: "Aggressive" });
      } else {
        score += 5;
        factors.push({ name: "Leverage", score: 5, max: 20, rating: "High Risk" });
      }
    }

    // Equity Capture Score (15 points max) - Higher is better
    if (out.equityCaptureRate) {
      maxScore += 15;
      if (out.equityCaptureRate >= 0.25) {
        score += 15;
        factors.push({ name: "Equity Position", score: 15, max: 15, rating: "Strong" });
      } else if (out.equityCaptureRate >= 0.15) {
        score += 12;
        factors.push({ name: "Equity Position", score: 12, max: 15, rating: "Good" });
      } else if (out.equityCaptureRate >= 0.10) {
        score += 8;
        factors.push({ name: "Equity Position", score: 8, max: 15, rating: "Adequate" });
      } else {
        score += 5;
        factors.push({ name: "Equity Position", score: 5, max: 15, rating: "Low" });
      }
    }

    // Excess Cash Flow Score (10 points max)
    maxScore += 10;
    if (out.excessCashFlow > 100000) {
      score += 10;
      factors.push({ name: "Cash Cushion", score: 10, max: 10, rating: "Excellent" });
    } else if (out.excessCashFlow > 50000) {
      score += 8;
      factors.push({ name: "Cash Cushion", score: 8, max: 10, rating: "Good" });
    } else if (out.excessCashFlow > 0) {
      score += 5;
      factors.push({ name: "Cash Cushion", score: 5, max: 10, rating: "Minimal" });
    } else {
      factors.push({ name: "Cash Cushion", score: 0, max: 10, rating: "Negative" });
    }

    const percentage = (score / maxScore) * 100;
    let grade = "F";
    let color = "red";
    let assessment = "Not Recommended";

    if (percentage >= 90) {
      grade = "A+";
      color = "green";
      assessment = "Exceptional Investment";
    } else if (percentage >= 85) {
      grade = "A";
      color = "green";
      assessment = "Excellent Investment";
    } else if (percentage >= 80) {
      grade = "A-";
      color = "green";
      assessment = "Very Strong Investment";
    } else if (percentage >= 75) {
      grade = "B+";
      color = "lime";
      assessment = "Strong Investment";
    } else if (percentage >= 70) {
      grade = "B";
      color = "lime";
      assessment = "Good Investment";
    } else if (percentage >= 65) {
      grade = "B-";
      color = "yellow";
      assessment = "Above Average";
    } else if (percentage >= 60) {
      grade = "C+";
      color = "yellow";
      assessment = "Average Investment";
    } else if (percentage >= 55) {
      grade = "C";
      color = "orange";
      assessment = "Below Average";
    } else if (percentage >= 50) {
      grade = "C-";
      color = "orange";
      assessment = "Marginal Investment";
    } else if (percentage >= 40) {
      grade = "D";
      color = "red";
      assessment = "Poor Investment";
    } else {
      grade = "F";
      color = "red";
      assessment = "Not Recommended";
    }

    return { score, maxScore, percentage, grade, color, assessment, factors };
  };

  const dealRating = useMemo(() => calculateDealRating(), [out]);

  // Helper to update nested state with better handling
  const updateDeal = (field: keyof typeof inputs.deal, value: any) => {
    setInputs(prev => ({ ...prev, deal: { ...prev.deal, [field]: value } }));
  };

  const updateBiz = (field: keyof typeof inputs.biz, value: any) => {
    setInputs(prev => ({ ...prev, biz: { ...prev.biz, [field]: value } }));
  };

  const updateFinancing = (field: keyof typeof inputs.financing, value: any) => {
    setInputs(prev => ({ ...prev, financing: { ...prev.financing, [field]: value } }));
  };

  const updateLender = (field: keyof typeof inputs.lender, value: any) => {
    setInputs(prev => ({ ...prev, lender: { ...prev.lender, [field]: value } }));
  };

  // Better number input handler - allows empty string
  const handleNumberInput = (value: string, setter: (val: number) => void) => {
    if (value === '' || value === '-') {
      setter(0);
    } else {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setter(num);
      }
    }
  };

  // PDF Export Handler (would implement jsPDF)
  const handleExportPDF = () => {
    alert(`PDF Export (Coming Soon!)\n\nThis will generate a branded PDF report with:\n- ${brokerBranding.companyName} branding\n- Complete deal analysis\n- All metrics and charts\n- Professional formatting\n\nStay tuned!`);
    // TODO: Implement jsPDF generation with broker branding
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* SGF HEADER BRANDING */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-brand-green-600 to-brand-green-700 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V9h7V2.99c3.77.98 6.61 4.22 7 8.01h-7v1.99z"/>
              </svg>
              Business Acquisition Analyzer
            </h1>
            <p className="text-brand-green-50 text-sm">
              AI-Powered deal analysis by <span className="font-bold text-brand-gold-300">Starting Gate Financial</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBrandingModal(true)}
              className="bg-gradient-to-r from-yellow-400 to-brand-gold-500 hover:from-yellow-500 hover:to-brand-gold-600 text-gray-900 font-bold px-5 py-3 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2 border-2 border-yellow-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              PDF Branding
            </button>
            <a
              href="https://startinggatefinancial.com/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-gold-500 hover:bg-brand-gold-600 text-gray-900 font-bold px-6 py-3 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Apply for Financing
            </a>
          </div>
        </div>
      </div>

      {/* Branding Modal */}
      {showBrandingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">PDF Report Branding</h3>
              <button onClick={() => setShowBrandingModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={brokerBranding.companyName}
                  onChange={(e) => setBrokerBranding({...brokerBranding, companyName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Broker Name</label>
                <input
                  type="text"
                  value={brokerBranding.brokerName}
                  onChange={(e) => setBrokerBranding({...brokerBranding, brokerName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={brokerBranding.phone}
                  onChange={(e) => setBrokerBranding({...brokerBranding, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={brokerBranding.email}
                  onChange={(e) => setBrokerBranding({...brokerBranding, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500"
                />
              </div>

              <div className="bg-brand-green-50 border border-brand-green-200 rounded-lg p-3 text-sm">
                <p className="text-gray-700">
                  <strong>Pro Feature:</strong> Upload your company logo and customize colors in the Pro version!
                </p>
              </div>

              <button
                onClick={() => setShowBrandingModal(false)}
                className="w-full bg-brand-green-600 hover:bg-brand-green-700 text-white font-bold py-3 rounded-lg transition-all"
              >
                Save Branding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INPUT FORM SECTION */}
      <section className="mb-8 rounded-2xl border-2 border-brand-gold-400 bg-gradient-to-br from-brand-gold-50 via-white to-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
          <svg className="w-6 h-6 text-brand-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Deal Inputs
        </h2>

        <div className="space-y-6">
          {/* DEAL INFORMATION */}
          <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-brand-green-700 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-green-100 flex items-center justify-center text-brand-green-700 font-bold">1</span>
              Deal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Industry/Business Type Field */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <span className="text-red-500">*</span> Industry / Business Type
                  <Tooltip content="Select the primary industry or business type. This helps provide industry-specific analysis and benchmarks.">
                    <InfoIcon className="w-3 h-3" />
                  </Tooltip>
                </label>
                <select
                  value={inputs.deal.industry || "Restaurant"}
                  onChange={(e) => updateDeal('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent bg-white"
                >
                  <option value="Restaurant">🍽️ Restaurant / Food Service</option>
                  <option value="Retail">🛍️ Retail / E-commerce</option>
                  <option value="Manufacturing">🏭 Manufacturing</option>
                  <option value="Professional Services">💼 Professional Services (Consulting, Legal, etc.)</option>
                  <option value="Healthcare">🏥 Healthcare / Medical Services</option>
                  <option value="Technology">💻 Technology / SaaS</option>
                  <option value="Construction">🔨 Construction / Trades</option>
                  <option value="Real Estate">🏠 Real Estate Services</option>
                  <option value="Hospitality">🏨 Hospitality / Hotel / Tourism</option>
                  <option value="Automotive">🚗 Automotive Services</option>
                  <option value="Beauty & Wellness">💆 Beauty & Wellness / Spa</option>
                  <option value="Education">📚 Education / Training</option>
                  <option value="Financial Services">💰 Financial Services</option>
                  <option value="Transportation">🚚 Transportation / Logistics</option>
                  <option value="Fitness">💪 Fitness / Gym / Sports</option>
                  <option value="Entertainment">🎭 Entertainment / Events</option>
                  <option value="Home Services">🏡 Home Services / Repair</option>
                  <option value="Franchise">🏪 Franchise (Specify in notes)</option>
                  <option value="Distribution">📦 Distribution / Wholesale</option>
                  <option value="Other">📋 Other / General Business</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Asking/Offer Price
                  <Tooltip content={getFieldDefinition("askingOrOfferPrice")}>
                    <InfoIcon className="w-3 h-3" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={inputs.deal.askingOrOfferPrice || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateDeal('askingOrOfferPrice', val))}
                  placeholder="Enter price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Annual Revenue
                  <Tooltip content={getFieldDefinition("annualRevenue")}>
                    <InfoIcon className="w-3 h-3" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={inputs.deal.annualRevenue || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateDeal('annualRevenue', val))}
                  placeholder="Enter revenue"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Annual Cash Flow (SDE/EBITDA)
                  <Tooltip content={getFieldDefinition("annualCashFlow")}>
                    <InfoIcon className="w-3 h-3" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={inputs.deal.annualCashFlow || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateDeal('annualCashFlow', val))}
                  placeholder="Enter cash flow"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FFE Value</label>
                <input
                  type="number"
                  value={inputs.deal.ffeValue || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateDeal('ffeValue', val))}
                  placeholder="Enter FFE value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
                <label className="flex items-center mt-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={inputs.deal.ffeIncludedInAsking === 'yes'}
                    onChange={(e) => updateDeal('ffeIncludedInAsking', e.target.checked ? 'yes' : 'no')}
                    className="mr-2 rounded text-brand-green-600 focus:ring-brand-green-500"
                  />
                  Included in asking price
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Value</label>
                <input
                  type="number"
                  value={inputs.deal.inventoryValue || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateDeal('inventoryValue', val))}
                  placeholder="Enter inventory"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
                <label className="flex items-center mt-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={inputs.deal.inventoryIncludedInAsking === 'yes'}
                    onChange={(e) => updateDeal('inventoryIncludedInAsking', e.target.checked ? 'yes' : 'no')}
                    className="mr-2 rounded text-brand-green-600 focus:ring-brand-green-500"
                  />
                  Included in asking price
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Real Estate Value</label>
                <input
                  type="number"
                  value={inputs.deal.realEstateValue || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateDeal('realEstateValue', val))}
                  placeholder="Enter RE value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
                <label className="flex items-center mt-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={inputs.deal.realEstateIncludedInAsking === 'yes'}
                    onChange={(e) => updateDeal('realEstateIncludedInAsking', e.target.checked ? 'yes' : 'no')}
                    className="mr-2 rounded text-brand-green-600 focus:ring-brand-green-500"
                  />
                  Included in asking price
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={inputs.deal.acquiringRealEstate === 'yes'}
                    onChange={(e) => updateDeal('acquiringRealEstate', e.target.checked ? 'yes' : 'no')}
                    className="mr-2 rounded text-brand-green-600 focus:ring-brand-green-500"
                  />
                  Acquiring Real Estate with Business
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Annual Rent Paid to Owner
                  <Tooltip content={getFieldDefinition("annualRentsPaidToOwnerRE")}>
                    <InfoIcon className="w-3 h-3" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={inputs.deal.annualRentsPaidToOwnerRE || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateDeal('annualRentsPaidToOwnerRE', val))}
                  placeholder="Enter annual rent"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* BUYER REQUIREMENTS */}
          <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-brand-green-700 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-green-100 flex items-center justify-center text-brand-green-700 font-bold">2</span>
              Buyer Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Buyer's Minimum Salary
                  <Tooltip content={getFieldDefinition("buyersMinimumSalary")}>
                    <InfoIcon className="w-3 h-3" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={inputs.biz.buyersMinimumSalary || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateBiz('buyersMinimumSalary', val))}
                  placeholder="Enter salary"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Capital</label>
                <input
                  type="number"
                  value={inputs.biz.workingCapitalRequirement || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateBiz('workingCapitalRequirement', val))}
                  placeholder="Enter working capital"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CAPEX (Maintenance)</label>
                <input
                  type="number"
                  value={inputs.biz.annualCapexMaintenance || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateBiz('annualCapexMaintenance', val))}
                  placeholder="Enter CAPEX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CAPEX (New Investments)</label>
                <input
                  type="number"
                  value={inputs.biz.annualCapexNewInvestments || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateBiz('annualCapexNewInvestments', val))}
                  placeholder="Enter CAPEX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* FINANCING STRUCTURE */}
          <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-brand-green-700 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-green-100 flex items-center justify-center text-brand-green-700 font-bold">3</span>
              Financing Structure
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Equity (Down Payment)</label>
                <input
                  type="number"
                  value={inputs.financing.buyerEquity || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateFinancing('buyerEquity', val))}
                  placeholder="Enter equity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seller Financing</label>
                <input
                  type="number"
                  value={inputs.financing.sellerFinancing || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateFinancing('sellerFinancing', val))}
                  placeholder="Enter seller note"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term Loan</label>
                <input
                  type="number"
                  value={inputs.financing.termLoan || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateFinancing('termLoan', val))}
                  placeholder="Enter loan amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revolving LOC</label>
                <input
                  type="number"
                  value={inputs.financing.revolvingLOC || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateFinancing('revolvingLOC', val))}
                  placeholder="Enter LOC (0 if none)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Costs</label>
                <input
                  type="number"
                  value={inputs.financing.closingCosts || ''}
                  onChange={(e) => handleNumberInput(e.target.value, (val) => updateFinancing('closingCosts', val))}
                  placeholder="Enter costs"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* LOAN TERMS */}
          <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-brand-green-700 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-green-100 flex items-center justify-center text-brand-green-700 font-bold">4</span>
              Loan Terms
            </h3>
            <div className="space-y-4">
              {/* Term Loan Section */}
              <div className="border-b pb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Term Loan</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">APR (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.lender.interestRateTermLoanAPR ? (inputs.lender.interestRateTermLoanAPR * 100).toFixed(2) : ''}
                      onChange={(e) => handleNumberInput(e.target.value, (val) => updateLender('interestRateTermLoanAPR', val / 100))}
                      placeholder="e.g., 10.50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term (Years)</label>
                    <input
                      type="number"
                      value={inputs.lender.termYears || ''}
                      onChange={(e) => handleNumberInput(e.target.value, (val) => updateLender('termYears', val))}
                      placeholder="e.g., 10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-brand-green-50 rounded-lg p-3 border border-brand-green-200">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Annual Debt Service</label>
                    <div className="text-lg font-bold text-brand-green-700">
                      {fmtUSD(out.termLoanAnnualDebtService)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {fmtUSD(out.termLoanMonthlyPmt)}/mo
                    </div>
                  </div>
                </div>
              </div>

              {/* LOC Section - Conditional */}
              {hasLOC && (
                <div className="border-b pb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Line of Credit (LOC)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LOC APR (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={inputs.lender.interestRateLOCAPR ? (inputs.lender.interestRateLOCAPR * 100).toFixed(2) : ''}
                        onChange={(e) => handleNumberInput(e.target.value, (val) => updateLender('interestRateLOCAPR', val / 100))}
                        placeholder="e.g., 12.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        Utilization (%)
                        <Tooltip content={getFieldDefinition("locUtilizationPct")}>
                          <InfoIcon className="w-3 h-3" />
                        </Tooltip>
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={inputs.lender.locUtilizationPct ? (inputs.lender.locUtilizationPct * 100).toFixed(0) : ''}
                        onChange={(e) => handleNumberInput(e.target.value, (val) => updateLender('locUtilizationPct', val / 100))}
                        placeholder="e.g., 35"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Annual Interest</label>
                      <div className="text-lg font-bold text-blue-700">
                        {fmtUSD(out.locAnnualInterestOnly)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Avg Balance: {fmtUSD(out.locAssumedAverageBalance)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Debt Service - Always Shown */}
              <div className="bg-gradient-to-r from-brand-gold-50 to-brand-gold-100 rounded-lg p-4 border-2 border-brand-gold-300">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Total Annual Debt Service:</span>
                  <div className="text-2xl font-bold text-brand-gold-700">
                    {fmtUSD(out.totalAnnualDebtService)}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1 text-right">
                  {fmtUSD(out.totalAnnualDebtService / 12)}/month average
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERALL DEAL RATING - NEW SECTION! */}
      <section className="mb-6 rounded-2xl border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-white p-6 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 mb-1">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Deal Intelligence Score
            </h2>
            <p className="text-sm text-gray-600">AI-powered acquisition rating based on 5 key factors</p>
          </div>
          <button
            onClick={handleExportPDF}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg shadow transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Overall Grade */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2" style={{borderColor: dealRating.color === 'green' ? '#10b981' : dealRating.color === 'lime' ? '#84cc16' : dealRating.color === 'yellow' ? '#eab308' : dealRating.color === 'orange' ? '#f97316' : '#ef4444'}}>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 mb-2">Overall Grade</div>
              <div className="text-6xl font-bold mb-2" style={{color: dealRating.color === 'green' ? '#10b981' : dealRating.color === 'lime' ? '#84cc16' : dealRating.color === 'yellow' ? '#eab308' : dealRating.color === 'orange' ? '#f97316' : '#ef4444'}}>
                {dealRating.grade}
              </div>
              <div className="text-sm font-semibold text-gray-700">{dealRating.assessment}</div>
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs text-gray-500">Score: {dealRating.score}/{dealRating.maxScore}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="h-2 rounded-full transition-all" 
                    style={{
                      width: `${dealRating.percentage}%`,
                      backgroundColor: dealRating.color === 'green' ? '#10b981' : dealRating.color === 'lime' ? '#84cc16' : dealRating.color === 'yellow' ? '#eab308' : dealRating.color === 'orange' ? '#f97316' : '#ef4444'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rating Factors */}
          <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-4">Rating Breakdown</h3>
            <div className="space-y-3">
              {dealRating.factors.map((factor, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{factor.name}</span>
                      <span className="text-xs text-gray-500">{factor.score}/{factor.max} pts</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          factor.score / factor.max >= 0.8 ? 'bg-green-500' :
                          factor.score / factor.max >= 0.6 ? 'bg-lime-500' :
                          factor.score / factor.max >= 0.4 ? 'bg-yellow-500' :
                          factor.score / factor.max >= 0.2 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{width: `${(factor.score / factor.max) * 100}%`}}
                      />
                    </div>
                  </div>
                  <span className={`ml-4 text-xs font-semibold px-2 py-1 rounded ${
                    factor.rating === 'Excellent' || factor.rating === 'Strong' || factor.rating === 'Conservative' ? 'bg-green-100 text-green-700' :
                    factor.rating === 'Very Good' || factor.rating === 'Good' || factor.rating === 'Moderate' ? 'bg-lime-100 text-lime-700' :
                    factor.rating === 'Fair' || factor.rating === 'Adequate' || factor.rating === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                    factor.rating === 'Marginal' || factor.rating === 'Aggressive' || factor.rating === 'Minimal' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {factor.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Market Intelligence Component */}
        <AIMarketIntelligence inputs={inputs} dealRating={dealRating} />
      </section>

      {/* Deal Summary */}
      <section className="mb-6 rounded-2xl border-2 border-brand-green-600 bg-gradient-to-br from-brand-green-50 to-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-brand-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Deal Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Purchase Price</div>
            <div className="text-2xl font-bold text-brand-green-600">{fmtUSD(out.purchasePrice)}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              DSCR
              <Tooltip content={getFieldDefinition("dscr")}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </div>
            <div className={`text-2xl font-bold ${
              out.dscr && out.dscr >= 1.35 ? "text-green-600" : 
              out.dscr && out.dscr >= 1.25 ? "text-yellow-600" : "text-red-600"
            }`}>
              {fmtDSCR(out.dscr)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              Cash-on-Cash
              <Tooltip content={getFieldDefinition("cashOnCashReturn")}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </div>
            <div className="text-2xl font-bold text-brand-gold-500">
              {formatPercent(out.cashOnCashReturn, 1)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Total Cash Needed</div>
            <div className="text-2xl font-bold text-gray-900">{fmtUSD(out.totalCashRequired)}</div>
          </div>
        </div>
      </section>

      {/* Deal Assumptions & Sources/Uses */}
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            Deal Assumptions
            <Tooltip content="Core business and deal structure assumptions">
              <InfoIcon />
            </Tooltip>
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-gray-600">Asking/Offer:</span>
              <b>{fmtUSD(inputs.deal.askingOrOfferPrice)}</b>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-600">Revenue:</span>
              <b>{fmtUSD(inputs.deal.annualRevenue)}</b>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gray-600">Cash Flow (SDE/EBITDA):</span>
              <b>{fmtUSD(inputs.deal.annualCashFlow)}</b>
            </li>
          </ul>
          <div className="mt-4 rounded bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Computed Purchase Price:</span>
              <b>{fmtUSD(out.purchasePrice)}</b>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-1">
                Price / SDE:
                <Tooltip content={getFieldDefinition("purchasePriceToSDEMultiple")}>
                  <InfoIcon className="w-3 h-3" />
                </Tooltip>
              </span>
              <b>{fmtMult(out.purchasePriceToSDEMultiple)}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price / Revenue:</span>
              <b>{fmtMult(out.purchasePriceToRevenueMultiple)}</b>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            Sources & Uses
            <Tooltip content="Capital structure showing where money comes from and where it goes">
              <InfoIcon />
            </Tooltip>
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">Sources</h3>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span className="text-gray-600">Buyer Equity:</span>
                  <b>{fmtUSD(inputs.financing.buyerEquity)}</b>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Seller Note:</span>
                  <b>{fmtUSD(inputs.financing.sellerFinancing)}</b>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Term Loan:</span>
                  <b>{fmtUSD(inputs.financing.termLoan)}</b>
                </li>
                {hasLOC && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">LOC:</span>
                    <b>{fmtUSD(inputs.financing.revolvingLOC)}</b>
                  </li>
                )}
              </ul>
              <div className="mt-2 pt-2 border-t font-semibold flex justify-between">
                <span>Total Sources:</span>
                <span className="text-brand-green-600">{fmtUSD(out.sourcesTotal)}</span>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Uses</h3>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span className="text-gray-600 text-xs">To Seller (Biz):</span>
                  <b className="text-xs">{fmtUSD(out.usesDueToSellerBusinessFFEInv)}</b>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 text-xs">To Seller (RE):</span>
                  <b className="text-xs">{fmtUSD(out.usesDueToSellerRE)}</b>
                </li>
                <li className="flex justify-between text-xs pt-1 border-t">
                  <span className="text-gray-600">Cash @ Close:</span>
                  <b>{fmtUSD(out.usesCashAtClosingToSeller)}</b>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Working Cap:</span>
                  <b>{fmtUSD(out.usesWorkingCapital)}</b>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Closing Costs:</span>
                  <b>{fmtUSD(out.usesClosingCosts)}</b>
                </li>
              </ul>
              <div className="mt-2 pt-2 border-t font-semibold flex justify-between">
                <span>Total Uses:</span>
                <span className="text-brand-green-600">{fmtUSD(out.usesTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Return Metrics */}
      <section className="mt-6 rounded-2xl border-2 border-brand-gold-500 bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-brand-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Return Metrics
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Cash-on-Cash Return */}
          <div className="rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Cash-on-Cash Return
                <Tooltip content={getFieldDefinition("cashOnCashReturn")}>
                  <InfoIcon className="w-3 h-3" />
                </Tooltip>
              </div>
              {out.cashOnCashReturn && out.cashOnCashReturn >= 0.25 ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Good</span>
              ) : out.cashOnCashReturn && out.cashOnCashReturn >= 0.15 ? (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Fair</span>
              ) : (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Low</span>
              )}
            </div>
            <div className="text-3xl font-bold text-green-600">
              {formatPercent(out.cashOnCashReturn, 1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Year 1 cash / equity</div>
          </div>

          {/* Return on Investment */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 p-4">
            <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              Return on Investment
              <Tooltip content={getFieldDefinition("returnOnInvestment")}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {formatPercent(out.returnOnInvestment, 1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Net cash / total invested</div>
          </div>

          {/* Leverage Ratio */}
          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Leverage Ratio
                <Tooltip content={getFieldDefinition("leverageRatio")}>
                  <InfoIcon className="w-3 h-3" />
                </Tooltip>
              </div>
              {out.leverageRatio && out.leverageRatio <= 3 ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Low Risk</span>
              ) : out.leverageRatio && out.leverageRatio <= 5 ? (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Moderate</span>
              ) : (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">High Risk</span>
              )}
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {out.leverageRatio?.toFixed(2) ?? "—"}x
            </div>
            <div className="text-xs text-gray-500 mt-1">Total debt / equity</div>
          </div>

          {/* Equity Capture Rate */}
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 p-4">
            <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              Equity Capture Rate
              <Tooltip content={getFieldDefinition("equityCaptureRate")}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </div>
            <div className="text-3xl font-bold text-amber-600">
              {formatPercent(out.equityCaptureRate, 1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Your ownership stake</div>
          </div>

          {/* Excess Cash Flow */}
          <div className="rounded-xl bg-gradient-to-br from-teal-50 to-white border border-teal-200 p-4">
            <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              Excess Cash Flow
              <Tooltip content={getFieldDefinition("excessCashFlow")}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            </div>
            <div className={`text-3xl font-bold ${out.excessCashFlow >= 0 ? "text-teal-600" : "text-red-600"}`}>
              {fmtUSD(out.excessCashFlow)}
            </div>
            <div className="text-xs text-gray-500 mt-1">After debt service</div>
          </div>

          {/* Total Cash Required */}
          <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Total Cash Required</div>
            <div className="text-3xl font-bold text-gray-900">{fmtUSD(out.totalCashRequired)}</div>
            <div className="text-xs text-gray-500 mt-1">Equity + closing costs</div>
          </div>
        </div>
      </section>

      {/* Deal Intelligence Dashboard (formerly Lender Analysis) */}
      <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <svg className="w-6 h-6 text-brand-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Deal Intelligence Dashboard
          <Tooltip content="Comprehensive cash flow and debt service analysis">
            <InfoIcon />
          </Tooltip>
        </h2>
        <div className="grid gap-6 md:grid-cols-3 text-sm mb-6">
          <div>
            <div className="text-gray-600 mb-1">Term Loan Payment (monthly):</div>
            <b className="text-lg">{fmtUSD(out.termLoanMonthlyPmt)}</b>
            <div className="text-gray-600 mt-1 text-xs">Annual: <b>{fmtUSD(out.termLoanAnnualDebtService)}</b></div>
          </div>
          {hasLOC && (
            <div>
              <div className="text-gray-600 mb-1">Avg LOC Balance:</div>
              <b className="text-lg">{fmtUSD(out.locAssumedAverageBalance)}</b>
              <div className="text-gray-600 mt-1 text-xs">Interest (annual): <b>{fmtUSD(out.locAnnualInterestOnly)}</b></div>
            </div>
          )}
          <div>
            <div className="text-gray-600 mb-1">Total Borrowings:</div>
            <b className="text-lg">{fmtUSD(inputs.financing.termLoan + inputs.financing.revolvingLOC)}</b>
            <div className="text-gray-600 mt-1 text-xs">Debt Service: <b>{fmtUSD(out.totalAnnualDebtService)}</b></div>
          </div>
        </div>

        {/* Visual Cash Flow Waterfall */}
        <CashFlowWaterfall
          sde={inputs.deal.annualCashFlow}
          buyerSalary={inputs.biz.buyersMinimumSalary}
          capex={totalCapex}
          debtService={out.totalAnnualDebtService}
          lendableCashFlow={out.lendableCashFlowBeforeDebt}
          netCashFlow={out.netCashFlowAfterDebt}
        />

        <p className="mt-4 text-xs text-gray-500 text-center">
          SBA typically requires DSCR ≥ 1.25x. Higher DSCR indicates stronger debt coverage.
        </p>
      </section>

      {/* SGF FOOTER */}
      <footer className="mt-12 border-t-2 border-brand-green-200 pt-8">
        <div className="text-center mb-6">
          <a
            href="https://startinggatefinancial.com/apply"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-green-600 hover:bg-brand-green-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ready to Finance This Deal? Apply Now
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6 text-sm">
          <div>
            <h3 className="font-bold text-brand-green-700 mb-2">About Starting Gate Financial</h3>
            <p className="text-gray-600">
              Commercial lending and business financing specialists serving entrepreneurs across North Texas and beyond.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-brand-green-700 mb-2">Contact Us</h3>
            <p className="text-gray-600">
              <strong>Location:</strong> Richardson, TX<br />
              <strong>Phone:</strong>{" "}
              <a
                href={`tel:${brokerBranding.phone.replace(/[^\d+]/g, "")}`}
                className="text-brand-gold-600 hover:underline"
              >
                {brokerBranding.phone}
              </a>
              <br />
              <strong>Email:</strong>{" "}
              <a
                href={`mailto:${brokerBranding.email}`}
                className="text-brand-gold-600 hover:underline"
              >
                {brokerBranding.email}
              </a>
            </p>
          </div>
          <div>
            <h3 className="font-bold text-brand-green-700 mb-2">Our Services</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• SBA 7(a) Loans</li>
              <li>• Business Acquisition Financing</li>
              <li>• Commercial Real Estate Loans</li>
              <li>• Equipment Financing</li>
              <li>• Lines of Credit</li>
            </ul>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 border-t pt-4">
          <p className="mb-2">
            © {new Date().getFullYear()} Starting Gate Financial. All rights reserved.
          </p>
          <p className="text-gray-400">
            This calculator provides estimates for informational purposes only. Actual loan terms and approval are subject to underwriting review.
            Consult with a Starting Gate Financial advisor for personalized guidance.
          </p>
        </div>
      </footer>

      {/* Legend Modal */}
      <LegendModal />
    </main>
  );
}
