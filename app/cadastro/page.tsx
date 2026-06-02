import { SignUp } from '@clerk/nextjs'

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Crie Sua Conta</h1>
          <p className="text-slate-400">Comece sua jornada na liberdade energética</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl",
              headerTitle: "text-white text-xl",
              headerSubtitle: "text-slate-400",
              formFieldLabel: "text-slate-300",
              formFieldInput: "bg-slate-900 border border-white/10 rounded-xl py-3 text-white",
              formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl py-3 font-bold",
              footerActionLink: "text-emerald-400 hover:text-emerald-300",
            }
          }}
          routing="path"
          path="/cadastro"
          redirectUrl="/dashboard-consumidor"
          signInUrl="/login"
        />
      </div>
    </div>
  )
}