// app/api/admin/pilot-users/route.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Admin emails - add yours here
const ADMIN_EMAILS = [
  'syed@startinggatefinancial.com',
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

  // Calculate expiry
  const pilotExpiresAt = expiryDays && expiryDays > 0
    ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
    : null;

  const pilotData = {
    pilotUser: true,
    plan: 'pro',
    pilotGrantedBy: session?.user?.email || 'admin',
    pilotGrantedAt: new Date(),
    pilotExpiresAt,
    pilotNotes: notes || null,
  };

  // Find user by email - create pre-registration if not found
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  
  if (user) {
    // User exists - update them
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: pilotData,
    });
    return NextResponse.json({ success: true, status: 'activated', user: updated });
  } else {
    // Pre-register: create a placeholder user record
    // When they sign up with this email, NextAuth will update the existing record
    const preRegistered = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        ...pilotData,
      },
    });
    return NextResponse.json({ success: true, status: 'pre-registered', message: `Pilot access pre-registered for ${email}. Will activate when they sign up.`, user: preRegistered });
  }
}
