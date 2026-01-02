import { prisma } from '@/lib/db';

export async function ensureUserHasFirstDeal(userId: string) {
  // Check if user already has any deals
  const existingDeals = await prisma.deal.findFirst({
    where: { userId },
  });

  if (existingDeals) {
    return existingDeals; // User already has deals, do nothing
  }

  // Create the user's first deal
  const firstDeal = await prisma.deal.create({
    data: {
      name: 'My First Deal Analysis',
      userId,
    },
  });

  return firstDeal;
}