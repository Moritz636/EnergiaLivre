export function Hero() {
  return (
    <section className="mesh-gradient relative min-h-screen overflow-hidden pt-28 pb-20 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-glow absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="animate-float absolute right-0 top-1/4 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl" />
        <div
          className="animate-float absolute bottom-20 left-10 h-48 w-48 rounded-full bg-emerald-400/10 blur-2xl"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Marketplace de energia solar no Brasil
          </div>

          <h1 className="animate-fade-up text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl [animation-delay:100ms] [animation-fill-mode:both]">
            Sua energia solar{" "}
            <span className="gradient-text">livre para circular</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl animate-fade-up [animation-delay:200ms] [animation-fill-mode:both]">
            Conectamos quem gera energia solar excedente com quem quer economizar na
            conta de luz. Simples, seguro e 100% digital.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-up [animation-delay:300ms] [animation-fill-mode:both]">
            <a
              id="vender"
              href="#vender"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-black transition hover:bg-zinc-100 sm:w-auto"
            >
              Quero vender energia
              <svg className="h-5 w-5 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              id="economizar"
              href="#simulador"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-black transition hover:bg-emerald-400 sm:w-auto"
            >
              Quero economizar
              <svg className="h-5 w-5 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 border-t border-white/10 pt-10 sm:grid-cols-4 animate-fade-up [animation-delay:400ms] [animation-fill-mode:both]">
            {[
              { value: "32%", label: "Economia média na conta" },
              { value: "2.400+", label: "Usuários conectados" },
              { value: "18 GWh", label: "Energia compartilhada" },
              { value: "4.2k t", label: "CO₂ evitado" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl animate-fade-up [animation-delay:500ms] [animation-fill-mode:both]">
          <div className="glass overflow-hidden rounded-3xl p-1 shadow-2xl shadow-emerald-500/10">
            <div className="rounded-[22px] bg-gradient-to-br from-emerald-950/80 to-black p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-red-500/80" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs text-zinc-500">energialivre.app</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Geradores ativos", val: "847", trend: "+12%" },
                  { label: "Energia disponível", val: "1.2 MW", trend: "hoje" },
                  { label: "Match realizado", val: "R$ 2.840", trend: "última hora" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:border-emerald-500/30 hover:bg-emerald-500/5"
                  >
                    <p className="text-xs text-zinc-500">{card.label}</p>
                    <p className="mt-1 text-xl font-bold text-white">{card.val}</p>
                    <p className="mt-1 text-xs font-medium text-emerald-400">{card.trend}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
