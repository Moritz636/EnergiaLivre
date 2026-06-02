import { SignIn } from '@clerk/nextjs'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Fundo que transmite poder e autoridade (Lei 1) */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          {/* Ícone que transmite autoridade */}
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
            <span className="text-4xl">️</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            Painel <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Administrativo</span>
          </h1>
          <p className="text-purple-300/70">
            Acesso restrito • Ambiente monitorado
          </p>
        </div>

        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              formFieldLabel: "text-purple-200 font-medium text-sm",
              formFieldInput: "bg-slate-900/50 border border-purple-500/30 rounded-xl py-3 px-4 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all",
              formButtonPrimary: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl py-3 font-bold text-lg transition-all transform hover:scale-[1.02] shadow-lg",
              footerActionLink: "text-purple-300 hover:text-purple-200 font-medium",
              dividerLine: "bg-purple-500/20",
              dividerText: "text-purple-400",
            },
            variables: {
              colorPrimary: '#a855f7',
              colorText: '#f1f5f9',
              colorTextSecondary: '#c084fc',
              colorBackground: '#020617',
              colorInputBackground: '#0f172a',
              colorInputText: '#f1f5f9',
            },
          }}
          routing="path"
          path="/admin-login"
          redirectUrl="/admin/dashboard"
          afterSignInUrl="/admin/dashboard"
        />

        <div className="text-center mt-8">
          <p className="text-purple-400/60 text-sm">
            🔒 Criptografia de ponta a ponta
          </p>
        </div>
      </div>
    </div>
  )
}