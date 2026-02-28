'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/product', label: 'Product' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/resources', label: 'Resources' },
  { href: '/sign-in', label: 'Sign In' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="Acqyrly home" onClick={close}>
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sgf-green-600 to-sgf-gold-500" />
          <span className="text-lg font-bold text-gray-900">Acqyrly</span>
          <span className="ml-2 rounded bg-sgf-gold-500/15 px-2 py-0.5 text-xs font-medium text-sgf-gold-600">by Starting Gate Financial</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              {label}
            </Link>
          ))}
          <Link
            href="/pricing"
            className="rounded-lg bg-sgf-green-600 text-white px-4 py-2 font-semibold text-sm shadow-sm hover:bg-sgf-green-700 transition-colors"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile hamburger / X */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile menu — slides down */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ease-in-out ${
          open ? 'max-h-96 border-t border-gray-100' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col px-6 py-4 gap-1 bg-white">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className="py-3 px-3 rounded-lg text-sm font-medium text-gray-700 hover:text-sgf-green-700 hover:bg-sgf-green-50 transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/pricing"
            onClick={close}
            className="mt-2 rounded-lg bg-sgf-green-600 text-white px-4 py-3 font-semibold text-sm text-center shadow-sm hover:bg-sgf-green-700 transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </div>
  );
}
