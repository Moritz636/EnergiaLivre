const impacts = [
  { value: "4.200 t", label: "CO₂ evitado", sub: "equivalente a 18 mil árvores" },
  { value: "18 GWh", label: "Energia limpa", sub: "compartilhada na plataforma" },
  { value: "100%", label: "Renovável", sub: "energia solar certificada" },
];

export function Sustainability() {
  return (
    <section id="sustentabilidade" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 bg-[#0b2e1f]/40" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-emerald-900/20 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Sustentabilidade
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Cada kWh compartilhado é um passo para um Brasil mais verde
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400">
              A EnergiaLivre transforma excedente solar em impacto real. Ao conectar
              geradores e consumidores, reduzimos desperdício energético e aceleramos a
              transição para uma matriz limpa.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Energia 100% solar, sem emissões na geração",
                "Rastreabilidade completa de origem renovável",
                "Contribuição direta para metas ESG e ODS 7 e 13",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-zinc-300">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-5">
            {impacts.map((impact) => (
              <div
                key={impact.label}
                className="glass rounded-2xl p-6 transition hover:border-emerald-500/30 hover:-translate-y-0.5"
              >
                <p className="text-3xl font-bold text-emerald-400">{impact.value}</p>
                <p className="mt-1 font-semibold text-white">{impact.label}</p>
                <p className="mt-1 text-sm text-zinc-500">{impact.sub}</p>
              </div>
            ))}

            <div className="glass col-span-full rounded-2xl p-6 lg:col-span-1">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                  <svg
                    className="h-7 w-7 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">Compromisso climático</p>
                  <p className="text-sm text-zinc-500">
                    Alinhado à transição energética do Brasil
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

