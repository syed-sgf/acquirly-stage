// app/api/admin/pilot-users/route.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Admin emails - add yours here
const ADMIN_EMAILS = [
  'your-email@gmail.com',
  'admin@startinggatefinancial.com',
  'syed@acquirely.com',
];

async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// GET - List all pilot users
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!await isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { pilotUser: true },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      pilotUser: true,
      pilotGrantedAt: true,
      pilotExpiresAt: true,
      pilotNotes: true,
      createdAt: true,
    },
    orderBy: { pilotGrantedAt: 'desc' },
  });

  return NextResponse.json(users);
}

// POST - Grant pilot access
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!await isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, notes, expiryDays } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ error: `No account found for ${email}. User must sign up first.` }, { status: 404 });
  }

  // Calculate expiry
  const pilotExpiresAt = expiryDays && expiryDays > 0
    ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
    : null;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      pilotUser: true,
      plan: 'pro', // Elevate plan to pro
      pilotGrantedBy: session?.user?.email || 'admin',
      pilotGrantedAt: new Date(),
      pilotExpiresAt,
      pilotNotes: notes || null,
    },
  });

  return NextResponse.json({ success: true, user: updated });
}
