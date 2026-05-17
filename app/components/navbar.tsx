"use client";

import { useState } from "react";

const links = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#simulador", label: "Simulador" },
  { href: "#sustentabilidade", label: "Sustentabilidade" },
  { href: "#vantagens", label: "Vantagens" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-400/30 transition group-hover:bg-emerald-500/30">
            <svg
              className="h-5 w-5 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Energia<span className="text-emerald-400">Livre</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#vender"
            className="rounded-full px-4 py-2 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/40 transition hover:bg-emerald-500/10"
          >
            Quero vender energia
          </a>
          <a
            href="#economizar"
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            Quero economizar
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-zinc-400 ring-1 ring-white/10 md:hidden"
          aria-label="Menu"
        >
          {open ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {open && (
        <div className="glass mx-4 mb-4 rounded-2xl p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-white/10" />
            <a
              href="#vender"
              onClick={() => setOpen(false)}
              className="rounded-full px-4 py-2.5 text-center text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/40"
            >
              Quero vender energia
            </a>
            <a
              href="#economizar"
              onClick={() => setOpen(false)}
              className="rounded-full bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-black"
            >
              Quero economizar
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
