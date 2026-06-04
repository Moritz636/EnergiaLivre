import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  try {
    // Verificações básicas
    const checks = {
      api: { status: 'ok', latency: 0 },
      env: {
        supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        stripe: !!process.env.STRIPE_SECRET_KEY,
        node: process.version,
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    checks.api.latency = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      service: 'energia-livre',
      version: '2.0.0',
      ...checks,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
