'use client'

// ============================================================
// /embaixador — Landing do Programa de Parceiros.
//
// Orquestra:
//   • Carregamento de comissões reais do backend.
//   • Composição de seções premium em _components/*.
// ============================================================

import { useEffect, useState } from 'react'
import { Nav } from './_components/Nav'
import { Hero } from './_components/Hero'
import { StepsGrid } from './_components/StepsGrid'
import { Simulador, type Comissoes } from './_components/Simulador'
import { PersonasGrid } from './_components/PersonasGrid'
import { WhyGrid } from './_components/WhyGrid'
import { WhatsappCta } from './_components/WhatsappCta'
import { LeadForm } from './_components/LeadForm'
import { Faq } from './_components/Faq'
import { Footer } from './_components/Footer'

const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/GjEnoYUW1kaFjyoPV5g43J'
const DEFAULT_COMISSOES: Comissoes = { signup: 15, recurring: 10, embaixador: 5, ufv: 15 }

export default function ProgramaEmbaixadores() {
  const [comissoes, setComissoes] = useState<Comissoes>(DEFAULT_COMISSOES)
  const [comissoesLoaded, setComissoesLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/public/commissions')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setComissoes({
            signup: data.signup ?? 15,
            recurring: data.recurring ?? 10,
            embaixador: data.embaixador ?? 5,
            ufv: data.ufv ?? 15,
          })
        }
        setComissoesLoaded(true)
      })
      .catch(() => setComissoesLoaded(true))
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <Nav whatsappGroupUrl={WHATSAPP_GROUP_URL} />

      <Hero whatsappGroupUrl={WHATSAPP_GROUP_URL} />

      <StepsGrid />

      <Simulador
        comissoes={comissoes}
        comissoesLoaded={comissoesLoaded}
        whatsappGroupUrl={WHATSAPP_GROUP_URL}
      />

      <PersonasGrid />

      <WhyGrid />

      <WhatsappCta whatsappGroupUrl={WHATSAPP_GROUP_URL} />

      <LeadForm whatsappGroupUrl={WHATSAPP_GROUP_URL} />

      <Faq />

      <Footer />
    </div>
  )
}
