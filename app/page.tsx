"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main className="bg-gradient-to-b from-white to-sgf-green-50">
      {/* Hero Section with Integrated Auth */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-12 text-center">
        <div className="inline-block mb-4 rounded-full bg-sgf-green-100 px-4 py-1.5 text-sm font-medium text-sgf-green-700">
          🚀 Professional Deal Analysis Platform
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
          Analyze Any Business Deal<br />
          <span className="text-sgf-green-600">in Minutes, Not Days</span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600 leading-relaxed">
          Professional acquisition intelligence for business buyers, brokers, and lenders. SBA-compliant calculations, instant valuations, and lender-ready reports—all in one platform.
        </p>

        {/* Auth Status - Centered */}
        {status === "authenticated" && session && (
          <div className="mt-6 inline-block bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Welcome back, <span className="font-semibold text-gray-900">{session.user?.name}</span></p>
            <p className="text-xs text-gray-500 uppercase mt-1">{session.user?.plan || "free"} plan</p>
          </div>
        )}
        
        {/* Sign In Button - Separate and Prominent */}
        {status === "unauthenticated" && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => signIn("google")}
              className="w-full sm:w-auto rounded-xl bg-sgf-green-600 px-10 py-4 text-lg text-white font-semibold shadow-lg hover:bg-sgf-green-700 transition-all hover:scale-105 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign In with Google
            </button>
          </div>
        )}

        {/* Dashboard Button - For Authenticated Users */}
        {status === "authenticated" && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/app"
              className="w-full sm:w-auto rounded-xl bg-sgf-green-600 px-10 py-4 text-lg text-white font-semibold shadow-lg hover:bg-sgf-green-700 transition-all hover:scale-105"
            >
              Go to Dashboard →
            </Link>
          </div>
        )}

        {/* Divider with "or" text */}
        <div className="mt-8 mb-6 flex items-center justify-center">
          <div className="border-t border-gray-300 flex-grow max-w-xs"></div>
          <span className="px-4 text-sm text-gray-500">or</span>
          <div className="border-t border-gray-300 flex-grow max-w-xs"></div>
        </div>
        
        {/* Action Buttons - Below Divider */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/core"
            className="w-full sm:w-auto rounded-xl border-2 border-sgf-green-600 px-8 py-4 text-lg text-sgf-green-700 font-semibold hover:bg-sgf-green-50 transition-all"
          >
            {status === "authenticated" ? "Analyze a Deal" : "Start Free with Core"}
          </Link>
          
          <Link
            href="/pro"
            className="w-full sm:w-auto rounded-xl border-2 border-gray-300 px-8 py-4 text-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
          >
            Explore Pro Features
          </Link>
        </div>

        {/* Sign Out Button - Small, Below CTAs */}
        {status === "authenticated" && (
          <div className="mt-4">
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Sign Out
            </button>
          </div>
        )}
        
        {!session && (
          <p className="mt-4 text-sm text-gray-500">
            No credit card required • Get started in 30 seconds
          </p>
        )}
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-sgf-green-600">500+</div>
            <div className="text-sm text-gray-600 mt-1">Deals Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-sgf-green-600">$50M+</div>
            <div className="text-sm text-gray-600 mt-1">Financing Secured</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-sgf-green-600">95%</div>
            <div className="text-sm text-gray-600 mt-1">User Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-sgf-green-600">24/7</div>
            <div className="text-sm text-gray-600 mt-1">Access Anywhere</div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
          Built for Acquisition Professionals
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Whether you're buying your first business or managing a portfolio, Acquirely delivers the insights you need to move deals forward with confidence.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Business Buyers & Real Estate Investors */}
          <div className="rounded-2xl bg-white p-8 ring-2 ring-gray-200 hover:ring-sgf-green-400 transition-all hover:shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-sgf-green-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-sgf-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Business Buyers & Investors</h3>
            <p className="text-gray-600 text-sm mb-4">Make confident acquisition decisions with comprehensive financial analysis</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cash-on-Cash return & ROI calculator</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>10-year wealth projection & equity build-up</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Scenario modeling (best/worst case)</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Business Brokers */}
          <div className="rounded-2xl bg-white p-8 ring-2 ring-gray-200 hover:ring-sgf-green-400 transition-all hover:shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-sgf-green-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-sgf-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Business Brokers</h3>
            <p className="text-gray-600 text-sm mb-4">Close deals faster with professional client presentations</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Custom-branded PDF reports</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Side-by-side deal comparison</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Instant valuation benchmarks</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Commercial Lenders */}
          <div className="rounded-2xl bg-white p-8 ring-2 ring-gray-200 hover:ring-sgf-green-400 transition-all hover:shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-sgf-green-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-sgf-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Commercial Lenders</h3>
            <p className="text-gray-600 text-sm mb-4">Pre-qualified borrowers with complete deal analysis</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Instant DSCR calculation</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>SBA-compliant documentation</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-sgf-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Complete financial projections</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
