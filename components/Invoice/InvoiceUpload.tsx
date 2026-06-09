'use client'

import { useState, useRef } from 'react'
import { Send, Loader2, CheckCircle2, Upload, FileText, X, Image } from 'lucide-react'
import { getSupabase } from '@/lib/supabase/singleton'

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const CONCESSIONARIAS = [
  'Enel', 'Equatorial', 'Cemig', 'Copel', 'Celesc', 'CPFL', 'Eletrobras',
  'Light', 'Neoenergia', 'Eletropaulo', 'Coelba', 'Celpe', 'Cosern',
  'RGE', 'CEEE', 'AES Sul', 'EDP', 'Elektro', 'Sulgás', 'Outra',
]

export default function InvoiceUpload() {
  const [consumo, setConsumo] = useState('')
  const [distribuidora, setDistribuidora] = useState('')
  const [estado, setEstado] = useState('')
  const [outraDistribuidora, setOutraDistribuidora] = useState('')
  const [valor, setValor] = useState('')
  const [vencimento, setVencimento] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo: 10MB')
      return
    }
    setFile(f)
    setError('')
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consumo || !estado) return
    setUploading(true)
    setError('')

    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Faça login para enviar faturas')
        setUploading(false)
        return
      }

      let fileUrl = null
      let fileType = null

      if (file) {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${user.id}/${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('faturas')
          .upload(path, file, { contentType: file.type })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setError('Erro ao enviar arquivo. Tente novamente.')
          setUploading(false)
          return
        }

        const { data: urlData } = supabase.storage.from('faturas').getPublicUrl(path)
        fileUrl = urlData?.publicUrl || path
        fileType = file.type
      }

      const dist = distribuidora === 'Outra' ? outraDistribuidora : distribuidora

      const { error: insertError } = await (supabase as any).from('faturas_upload').insert({
        user_id: user.id,
        file_url: fileUrl,
        file_type: fileType,
        file_name: file?.name || null,
        consumo_kwh: Number(consumo),
        distribuidora: dist || null,
        estado,
        valor: valor ? Number(valor.replace(',', '.')) : null,
        vencimento: vencimento || null,
        status: 'pendente',
      })

      if (insertError) {
        console.error('Insert error:', insertError)
      }

      setSent(true)
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <p className="text-lg font-bold text-white mb-2">Fatura enviada!</p>
        <p className="text-sm text-slate-400 mb-6">
          Nossa equipe vai analisar seus dados e enviar uma proposta personalizada pelo WhatsApp em até 24h úteis.
        </p>
        <button
          onClick={() => { setSent(false); setConsumo(''); setDistribuidora(''); setEstado(''); setValor(''); setVencimento(''); removeFile() }}
          className="px-6 py-2 bg-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition"
        >
          Enviar outra fatura
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File Upload Area */}
      <div>
        <label className="block text-xs text-slate-400 mb-2">Foto/PDF da fatura (opcional mas recomendado)</label>
        {file ? (
          <div className="relative p-4 rounded-xl bg-white/5 border border-white/10">
            <button type="button" onClick={removeFile} className="absolute top-2 right-2 p-1 rounded-lg bg-white/10 hover:bg-white/20">
              <X className="w-3 h-3 text-slate-400" />
            </button>
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-40 object-contain rounded-lg" />
            ) : (
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-sm text-white font-medium">{file.name}</p>
                  <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-emerald-500/30 bg-white/[0.02] transition flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-slate-500" />
            <p className="text-xs text-slate-400">Clique para enviar foto ou PDF da fatura</p>
            <p className="text-[10px] text-slate-600">JPG, PNG, WebP ou PDF · Máx 10MB</p>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Consumo (kWh/mês) *</label>
          <input
            type="number"
            value={consumo}
            onChange={(e) => setConsumo(e.target.value)}
            placeholder="300"
            min="1"
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Estado (UF) *</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            required
          >
            <option value="">UF</option>
            {UF_LIST.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Distribuidora</label>
        <select
          value={distribuidora}
          onChange={(e) => setDistribuidora(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500/50"
        >
          <option value="">Selecione</option>
          {CONCESSIONARIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {distribuidora === 'Outra' && (
          <input
            type="text"
            value={outraDistribuidora}
            onChange={(e) => setOutraDistribuidora(e.target.value)}
            placeholder="Qual distribuidora?"
            className="w-full mt-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Valor (R$)</label>
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="189,90"
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Vencimento</label>
          <input
            type="text"
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
            placeholder="15/07/2026"
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!consumo || !estado || uploading}
        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
      >
        {uploading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
        ) : (
          <><Send className="w-4 h-4" /> Enviar fatura</>
        )}
      </button>

      <p className="text-[10px] text-slate-500 text-center leading-relaxed">
        Sua fatura será analisada pela nossa equipe técnica.
        Você receberá uma proposta personalizada pelo WhatsApp em até 24h úteis.
      </p>
    </form>
  )
}
