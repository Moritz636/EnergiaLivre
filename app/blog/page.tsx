import Link from 'next/link'
import { posts } from '@/content/blog/posts'
import { BookOpen, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Blog | EnergiaLivre — Energia Solar sem Placa',
  description: 'Aprenda como economizar na conta de luz com créditos de energia solar, cessão de excedente, mercado livre e regulação ANEEL.',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <div className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
              <BookOpen className="text-slate-900 w-4 h-4" />
            </div>
            <span className="text-xl font-black text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-emerald-400 transition">
            ← Voltar
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-4 uppercase tracking-wider">
            <BookOpen className="w-3 h-3" /> Blog
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Energia solar para todos
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Conteúdo prático sobre economia de energia, cessão de créditos, regulação ANEEL e o futuro do mercado livre.
          </p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-slate-500">{post.date}</span>
                <span className="text-[10px] text-slate-600">·</span>
                <span className="text-[10px] text-slate-500">{post.readTime} leitura</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white group-hover:text-emerald-400 transition mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-slate-400 mb-3">
                {post.description}
              </p>
              <div className="flex items-center gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {tag}
                  </span>
                ))}
                <span className="ml-auto text-emerald-400 group-hover:translate-x-1 transition inline-flex items-center gap-1 text-xs font-bold">
                  Ler mais <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
