export function CtaBanner() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950 to-black px-8 py-14 text-center sm:px-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-emerald-400/10 blur-3xl" />
          <h2 className="relative text-3xl font-bold text-white sm:text-4xl">
            Pronto para liberar sua energia?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-zinc-400">
            Junte-se a milhares de brasileiros que já fazem parte da revolução da energia
            solar compartilhada.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#vender"
              className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-black transition hover:bg-zinc-100"
            >
              Quero vender energia
            </a>
            <a
              href="#economizar"
              className="rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-bold text-black transition hover:bg-emerald-400"
            >
              Quero economizar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

