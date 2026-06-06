import Link from 'next/link';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-slate-500 text-xs space-y-2">
        <p>
          © {year} EnergiaLivre · Plataforma de transferência de créditos de energia solar
        </p>
        <p className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/termos" className="hover:text-emerald-400 transition">
            Termos de Uso
          </Link>
          <span aria-hidden>·</span>
          <Link href="/regulamentacao" className="hover:text-emerald-400 transition">
            Regulamentação ANEEL
          </Link>
          <span aria-hidden>·</span>
          <a
            href="mailto:contato@energialivre.dev.br"
            className="hover:text-emerald-400 transition"
          >
            contato@energialivre.dev.br
          </a>
        </p>
      </div>
    </footer>
  );
}
