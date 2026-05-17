const footerLinks = {
  Produto: [
    { label: "Como funciona", href: "#como-funciona" },
    { label: "Simulador", href: "#simulador" },
    { label: "Para geradores", href: "#vender" },
    { label: "Para consumidores", href: "#economizar" },
  ],
  Empresa: [
    { label: "Sobre nós", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Carreiras", href: "#" },
    { label: "Imprensa", href: "#" },
  ],
  Legal: [
    { label: "Termos de uso", href: "#" },
    { label: "Privacidade", href: "#" },
    { label: "LGPD", href: "#" },
    { label: "Regulamentação ANEEL", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-400/30">
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
              <span className="text-lg font-bold text-white">
                Energia<span className="text-emerald-400">Livre</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500">
              O marketplace brasileiro que conecta energia solar excedente a quem quer
              economizar. Tecnologia, sustentabilidade e impacto financeiro real.
            </p>
            <div className="mt-6 flex gap-4">
              {["linkedin", "instagram", "twitter"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition hover:border-emerald-500/40 hover:text-emerald-400"
                  aria-label={social}
                >
                  <span className="text-xs font-bold uppercase">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white">{title}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-zinc-500 transition hover:text-emerald-400"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} EnergiaLivre. Todos os direitos reservados.
          </p>
          <p className="text-xs text-zinc-600">
            Feito com energia limpa no Brasil 🇧🇷
          </p>
        </div>
      </div>
    </footer>
  );
}
