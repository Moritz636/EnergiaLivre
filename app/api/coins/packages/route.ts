import { listActivePackages } from '@/lib/coins/wallet';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const packages = await listActivePackages();
    return NextResponse.json({ packages });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Erro ao listar pacotes' },
      { status: 500 }
    );
  }
}
