// app/api/admin/pilot-users/[userId]/route.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const ADMIN_EMAILS = [
  'your-email@gmail.com',
  'admin@startinggatefinancial.com',
  'syed@acquirely.com',
];

// DELETE - Revoke pilot access
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!ADMIN_EMAILS.includes(session?.user?.email?.toLowerCase() || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;

  await prisma.user.update({
    where: { id: userId },
    data: {
      pilotUser: false,
      plan: 'free', // Revert to free
      pilotExpiresAt: new Date(), // Mark as expired
    },
  });

  return NextResponse.json({ success: true });
}
