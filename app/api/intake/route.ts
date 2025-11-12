import { NextResponse } from 'next/server';

// Use node runtime only if you rely on Node libs; otherwise you can remove this.
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const data = await req.json().catch(() => ({}));
    // TODO: validate/process 'data' as needed
    return NextResponse.json({ ok: true, received: data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

// Optional: simple GET for quick health check
export async function GET() {
  return NextResponse.json({ ok: true });
}
