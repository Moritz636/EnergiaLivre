'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, FileText, X } from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'

interface InvoiceUploadProps {
  onSuccess?: (invoiceId: string) => void
  defaultRole?: 'consumidor' | 'embaixador'
  defaultClienteNome?: string
  defaultClienteWhatsapp?: string
}

export default function InvoiceUpload({
  onSuccess,
  defaultRole = 'consumidor',
  defaultClienteNome = '',
  defaultClienteWhatsapp = '',
}: InvoiceUploadProps) {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [clienteNome, setClienteNome] = useState(defaultClienteNome)
  const [clienteWhatsapp, setClienteWhatsapp] = useState(defaultClienteWhatsapp)

  const isEmbaixador = profile?.tipo === 'parceiro' || defaultRole === 'embaixador'

  const handleFile = (f: File | null) => {
    setError('')
    if (!f) {
      setFile(null)
      return
    }
    const okTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'application/pdf']
    if (!okTypes.includes(f.type)) {
      setError('Tipo de arquivo não suportado. Use PNG, JPG, WEBP, HEIC ou PDF.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande (máx 10MB).')
      return
    }
    setFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !user) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('uploaded_by_role', isEmbaixador ? 'embaixador' : 'consumidor')
      if (isEmbaixador) {
        if (clienteNome) fd.append('cliente_nome', clienteNome)
        if (clienteWhatsapp) fd.append('cliente_whatsapp', clienteWhatsapp)
      }

      const res = await fetch('/api/invoices', { method: 'POST', body: fd })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro no upload')
      const invoiceId = body.invoice?.id
      if (!invoiceId) throw new Error('ID da fatura não retornado')
      if (onSuccess) onSuccess(invoiceId)
      else router.push(`/dashboard/faturas/${invoiceId}`)
    } catch (err: any) {
      setError(err?.message || 'Erro no upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isEmbaixador && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-xs text-yellow-300 font-bold">
            Modo Parceiro
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Esta fatura será cadastrada em nome de um cliente da sua rede. Preencha os dados dele abaixo.
          </p>
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              placeholder="Nome do cliente"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            <input
              type="text"
              value={clienteWhatsapp}
              onChange={(e) => setClienteWhatsapp(e.target.value)}
              placeholder="WhatsApp (ex: 84999998888)"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>
      )}

      <div
        className={`p-8 border-2 border-dashed rounded-2xl text-center transition ${
          file
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-white/15 bg-white/5 hover:bg-white/10'
        }`}
      >
        {file ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-bold text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-400">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="p-1.5 rounded hover:bg-white/10"
              aria-label="Remover"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-white font-bold mb-1">
              Arraste sua fatura aqui
            </p>
            <p className="text-xs text-slate-400 mb-3">
              ou clique para selecionar (PNG, JPG, WEBP, HEIC, PDF — máx 10MB)
            </p>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/heic,application/pdf"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              className="hidden"
              id="invoice-file"
            />
            <label
              htmlFor="invoice-file"
              className="inline-block px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-sm font-bold cursor-pointer hover:bg-emerald-500/30 transition"
            >
              Selecionar arquivo
            </label>
          </>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || uploading}
        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#020617] font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" /> Enviar fatura
          </>
        )}
      </button>

      <p className="text-[10px] text-slate-500 text-center">
        Após o envio, você poderá revisar os dados extraídos antes de gerar matches com geradores.
      </p>
    </form>
  )
}
