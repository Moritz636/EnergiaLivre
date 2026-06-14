import { notFound } from 'next/navigation'
import Link from 'next/link'
import { posts } from '@/content/blog/posts'
import { ArrowLeft, BookOpen, Calendar, Clock } from 'lucide-react'

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug)
  if (!post) return { title: 'Post não encontrado | EnergiaLivre' }
  return {
    title: `${post.title} | EnergiaLivre`,
    description: post.description,
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <div className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/blog" className="text-sm text-slate-400 hover:text-emerald-400 transition flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Blog
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-sm font-black text-white">ENERGIA<span className="text-emerald-500">LIVRE</span></span>
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-4">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime} leitura</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-2 mb-10">
          {post.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{tag}</span>
          ))}
        </div>

        <div className="prose prose-invert max-w-none space-y-5 text-slate-300 leading-relaxed">
          {post.content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-slate-400 text-sm mb-4">Gostou do conteúdo? Economize na sua conta de luz.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl font-bold transition"
          >
            <BookOpen className="w-4 h-4" /> Simular economia agora
          </Link>
        </div>
      </article>
    </div>
  )
}
