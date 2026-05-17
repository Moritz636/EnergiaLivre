const benefits = [
  {
    role: "Para consumidores",
    title: "Economia imediata na conta",
    items: [
      "Até 32% de redução na fatura de energia",
      "Sem investimento em painéis solares",
      "Contrato flexível, cancele quando quiser",
      "Preço fixo abaixo da tarifa convencional",
    ],
    cta: "Quero economizar",
    href: "#economizar",
    highlight: false,
  },
  {
    role: "Para geradores",
    title: "Monetize seu excedente",
    items: [
      "Receba por cada kWh compartilhado",
      "Valorização do investimento em solar",
      "Gestão 100% digital do seu portfólio",
      "Pagamentos automáticos mensais",
    ],
    cta: "Quero vender energia",
    href: "#vender",
    highlight: true,
  },
];

export function FinancialBenefits() {
  return (
    <section id="vantagens" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Vantagens financeiras
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ganhe de todos os lados do marketplace
          </h2>
          <p className="mt-4 text-zinc-400">
            Seja você quem gera ou quem consome, a EnergiaLivre cria valor real para o
            seu bolso.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {benefits.map((b) => (
            <article
              key={b.role}
              className={`relative overflow-hidden rounded-3xl border p-8 sm:p-10 transition hover:-translate-y-1 ${
                b.highlight
                  ? "border-emerald-500/40 bg-gradient-to-br from-emerald-950/60 to-black shadow-xl shadow-emerald-500/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {b.highlight && (
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
              )}
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  b.highlight
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-white/10 text-zinc-400"
                }`}
              >
                {b.role}
              </span>
              <h3 className="mt-4 text-2xl font-bold text-white">{b.title}</h3>
              <ul className="mt-6 space-y-3">
                {b.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-zinc-300">
                    <svg
                      className={`h-5 w-5 shrink-0 ${b.highlight ? "text-emerald-400" : "text-zinc-500"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={b.href}
                className={`mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition ${
                  b.highlight
                    ? "bg-emerald-500 text-black hover:bg-emerald-400"
                    : "bg-white text-black hover:bg-zinc-100"
                }`}
              >
                {b.cta}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </article>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Ticket médio economizado", value: "R$ 144/mês" },
            { label: "Retorno geradores", value: "+18% ROI" },
            { label: "Tempo de ativação", value: "< 48h" },
            { label: "Taxa plataforma", value: "8% apenas" },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-5 text-center"
            >
              <p className="text-lg font-bold text-white sm:text-xl">{metric.value}</p>
              <p className="mt-1 text-xs text-zinc-500">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

