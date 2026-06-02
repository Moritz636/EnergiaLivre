import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

// Proteção para usuários comuns
export function protectRoute() {
  const { userId } = auth()
  if (!userId) redirect('/login')
  return userId
}

// Proteção para admins (Lei 1: Nunca ofusque o mestre)
export function protectAdminRoute() {
  const { userId } = auth()
  if (!userId) redirect('/admin-login')
  // Aqui você pode adicionar lógica para verificar se é admin
  return userId
}