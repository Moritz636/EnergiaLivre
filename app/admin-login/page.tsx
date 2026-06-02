import { SignIn } from '@clerk/nextjs'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
          <p className="text-slate-400">Acesso restrito</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-3xl p-8 shadow-2xl",
              headerTitle: "text-white text-xl",
              headerSubtitle: "text-purple-300",
              formFieldLabel: "text-purple-200",
              formFieldInput: "bg-slate-900 border border-purple-500/30 rounded-xl py-3 text-white",
              formButtonPrimary: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl py-3 font-bold",
              footerActionLink: "text-purple-300",
            }
          }}
          routing="path"
          path="/admin-login"
          redirectUrl="/admin/dashboard"
        />
      </div>
    </div>
  )
}