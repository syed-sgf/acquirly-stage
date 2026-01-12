import { prisma } from '@/lib/db';

export async function ensureUserHasFirstDeal(userId: string) {
  // Check if user already has any deals
  const existingDeals = await prisma.deal.findFirst({
    where: { userId },
  });

  if (existingDeals) {
    return existingDeals; // User already has deals, do nothing
  }

  // Find or create organization for this user
  let membership = await prisma.membership.findFirst({
    where: { userId },
    include: { organization: true }
  });

  // If user has no organization, create one
  if (!membership) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    const userName = user?.name || user?.email || userId;
    const orgName = `${userName}'s Organization`;
    const slug = `org-${userId.slice(0, 8)}`;

    const organization = await prisma.organization.create({
      data: {
        name: orgName,
        slug: slug,
        members: {
          create: {
            userId,
            role: 'owner'
          }
        }
      }
    });

    membership = await prisma.membership.findFirst({
      where: { userId },
      include: { organization: true }
    });
  }

  // Create the user's first deal with both userId and organizationId
  const firstDeal = await prisma.deal.create({
    data: {
      name: 'My First Deal Analysis',
      userId,
      organizationId: membership!.organizationId,
    },
  });

  return firstDeal;
}