import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="Acqyrly home">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sgf-green-600 to-sgf-gold-500" />
          <span className="text-lg font-bold text-gray-900">Acqyrly</span>
          <span className="ml-2 rounded bg-sgf-gold-500/15 px-2 py-0.5 text-xs font-medium text-sgf-gold-600">by Starting Gate Financial</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/product" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Product
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Pricing
          </Link>
          <Link href="/resources" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Resources
          </Link>
          <Link
            href="/sign-in"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg bg-sgf-green-600 text-white px-4 py-2 font-semibold text-sm shadow-sm hover:bg-sgf-green-700 transition-colors"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>
    </div>
  );
}
