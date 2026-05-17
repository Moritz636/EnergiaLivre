"use client";

import { useState } from "react";

const MIN_BILL = 150;
const MAX_BILL = 2000;
const SAVINGS_RATE = 0.32;

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function SavingsSimulator() {
  const [bill, setBill] = useState(450);

  const monthlySavings = Math.round(bill * SAVINGS_RATE);
  const yearlySavings = monthlySavings * 12;
  const percent = Math.round(SAVINGS_RATE * 100);

  return (
    <section id="simulador" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Simulador
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Quanto você pode economizar?
          </h2>
          <p className="mt-4 text-zinc-400">
            Ajuste o valor da sua conta de luz e veja uma estimativa de economia ao
            consumir energia solar compartilhada.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <div className="glass rounded-3xl p-8 sm:p-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <label htmlFor="bill-slider" className="text-sm font-medium text-zinc-400">
                Valor médio da sua conta de luz
              </label>
              <p className="text-3xl font-bold text-white">{formatCurrency(bill)}</p>
            </div>

            <input
              id="bill-slider"
              type="range"
              min={MIN_BILL}
              max={MAX_BILL}
              step={10}
              value={bill}
              onChange={(e) => setBill(Number(e.target.value))}
              className="mt-6 h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-emerald-500"
            />

            <div className="mt-2 flex justify-between text-xs text-zinc-600">
              <span>{formatCurrency(MIN_BILL)}</span>
              <span>{formatCurrency(MAX_BILL)}</span>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center transition hover:scale-[1.02]">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-400/80">
                  Economia mensal
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-300">
                  {formatCurrency(monthlySavings)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center transition hover:scale-[1.02]">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Economia anual
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {formatCurrency(yearlySavings)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center transition hover:scale-[1.02]">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Redução estimada
                </p>
                <p className="mt-2 text-2xl font-bold text-white">até {percent}%</p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-zinc-600">
              *Estimativa baseada na média de economia dos usuários EnergiaLivre. Valores
              podem variar conforme região e disponibilidade.
            </p>

            <a
              href="#economizar"
              className="mt-8 flex w-full items-center justify-center rounded-full bg-emerald-500 py-4 text-base font-bold text-black transition hover:bg-emerald-400"
            >
              Começar a economizar agora
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
