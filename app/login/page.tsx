import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Fundo com gradiente que transmite poder e exclusividade */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Título que ativa o desejo de domínio */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Acesse o <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400">Controle</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Entre para dominar sua conta de luz
          </p>
        </div>

        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl",
              headerTitle: "hidden", // Esconde o título padrão (já temos o nosso)
              headerSubtitle: "hidden",
              formFieldLabel: "text-slate-300 font-medium text-sm",
              formFieldInput: "bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all",
              formButtonPrimary: "bg-gradient-to-r from-emerald-500 to-yellow-500 hover:from-emerald-400 hover:to-yellow-400 text-slate-900 rounded-xl py-3 font-bold text-lg transition-all transform hover:scale-[1.02] shadow-lg",
              footerActionLink: "text-emerald-400 hover:text-emerald-300 font-medium",
              dividerLine: "bg-white/10",
              dividerText: "text-slate-500",
              socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl py-3 transition-all",
            },
            variables: {
              colorPrimary: '#10b981',
              colorText: '#f1f5f9',
              colorTextSecondary: '#94a3b8',
              colorBackground: '#020617',
              colorInputBackground: '#0f172a',
              colorInputText: '#f1f5f9',
            },
          }}
          routing="path"
          path="/login"
          redirectUrl="/dashboard-consumidor"
          signUpUrl="/cadastro"
          afterSignInUrl="/dashboard-consumidor"
        />

        {/* Rodapé que transmite exclusividade */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Ambiente protegido • Criptografia SSL • Dados seguros
          </p>
        </div>
      </div>
    </div>
  )
}