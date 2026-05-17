const steps = [
  {
    step: "01",
    title: "Cadastre-se na plataforma",
    description:
      "Crie sua conta em minutos. Informe se você é gerador com energia excedente ou consumidor buscando economia.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
  },
  {
    step: "02",
    title: "Conectamos o match perfeito",
    description:
      "Nosso algoritmo cruza oferta e demanda na sua região, garantindo o melhor preço e máxima eficiência energética.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    ),
  },
  {
    step: "03",
    title: "Energia compartilhada",
    description:
      "A energia solar excedente é direcionada ao consumidor via compensação na rede, com rastreabilidade total.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    ),
  },
  {
    step: "04",
    title: "Economize ou lucre",
    description:
      "Consumidores pagam menos na conta. Geradores monetizam o excedente que antes era desperdiçado.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Como funciona
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Energia solar compartilhada em 4 passos
            </h2>
          </div>
          <p className="max-w-md text-zinc-400 lg:text-right">
            Democratizamos o acesso à energia limpa com um marketplace simples, seguro e
            regulado para o mercado brasileiro.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, i) => (
            <article
              key={item.step}
              className="group relative rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.06] to-transparent p-6 transition hover:border-emerald-500/30 hover:-translate-y-1"
              style={{ transitionDuration: "300ms" }}
            >
              <span className="text-5xl font-black text-emerald-500/10 transition group-hover:text-emerald-500/20">
                {item.step}
              </span>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {item.icon}
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.description}</p>
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-emerald-500/30 lg:block" />
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

