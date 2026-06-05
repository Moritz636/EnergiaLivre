import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listMyCoupons, getMyReferralCode } from '@/lib/coupons'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const [coupons, referralCode] = await Promise.all([
      listMyCoupons(supabase, user.id),
      getMyReferralCode(supabase, user.id),
    ])

    return NextResponse.json({
      success: true,
      coupons,
      referralCode,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
