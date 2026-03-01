import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', platform: 'acqyrly' }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const payload = await req.json();

  const eventType: string = payload?.type ?? 'UNKNOWN';
  const entityId: string = payload?.data?.id ?? payload?.id ?? 'unknown';

  console.log(`[Finix webhook] type=${eventType} id=${entityId}`);

  switch (eventType) {
    case 'TRANSFER.CREATED':
    case 'TRANSFER.UPDATED':
      break;

    case 'MERCHANT.CREATED':
    case 'MERCHANT.UPDATED':
    case 'MERCHANT.UNDERWRITTEN':
      break;

    case 'SETTLEMENT.CREATED':
    case 'SETTLEMENT.UPDATED':
    case 'SETTLEMENT.ACCRUING_STARTED':
      break;

    case 'AUTHORIZATION.CREATED':
    case 'AUTHORIZATION.UPDATED':
      break;

    case 'DISPUTE.CREATED':
    case 'DISPUTE.UPDATED':
      break;

    case 'IDENTITY.CREATED':
    case 'IDENTITY.UPDATED':
      break;

    default:
      console.log(`[Finix webhook] unhandled event type: ${eventType}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
