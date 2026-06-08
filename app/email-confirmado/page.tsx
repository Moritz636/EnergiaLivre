import { Suspense } from 'react'
import EmailConfirmadoContent from './content'

export default function EmailConfirmadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <EmailConfirmadoContent />
    </Suspense>
  )
}
