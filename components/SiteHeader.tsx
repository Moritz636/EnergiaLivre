import Link from 'next/link';
import { Zap } from 'lucide-react';

interface SiteHeaderProps {
  showNav?: boolean;
  backHref?: string;
  backLabel?: string;
}

export default function SiteHeader({ showNav = true, backHref, backLabel }: SiteHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-slate-950/85 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
              <Zap className="text-slate-900 w-4 h-4 fill-current" />
            </div>
            <span className="text-base font-black text-white tracking-tight hidden sm:inline">EnergiaLivre</span>
          </Link>
          {backHref && (
            <Link
              href={backHref}
              className="text-xs text-slate-400 hover:text-emerald-400 transition flex items-center gap-1 ml-2 truncate"
            >
              ← {backLabel ?? 'Voltar'}
            </Link>
          )}
        </div>
        {showNav && (
          <nav className="flex items-center gap-2 sm:gap-4 text-sm">
            <Link href="/simulador" className="hidden md:inline text-slate-300 hover:text-white transition">
              Simulador
            </Link>
            <Link href="/regulamentacao" className="hidden md:inline text-slate-300 hover:text-white transition">
              Regulamentação
            </Link>
            <Link href="/manifesto" className="hidden md:inline text-slate-300 hover:text-white transition">
              Manifesto
            </Link>
            <Link href="/token" className="hidden md:inline text-amber-300 hover:text-amber-200 transition font-bold">
              Token
            </Link>
            <Link href="/login" className="text-slate-300 hover:text-white transition px-3 py-1.5">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="bg-emerald-500 text-slate-900 px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm hover:bg-emerald-400 transition"
            >
              Cadastrar
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
