export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export default async function NewDealPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/');

  async function createDeal(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;

    if (!name || name.trim().length === 0) {
      throw new Error('Deal name is required');
    }

    // Find or create organization for this user
    let membership = await prisma.membership.findFirst({
      where: { userId: session!.user!.id },
      include: { organization: true }
    });

    // If user has no organization, create one
    if (!membership) {
      const userEmail = session!.user!.email || session!.user!.id;
      const userName = session!.user!.name || userEmail;
      const orgName = `${userName}'s Organization`;
      const slug = `org-${session!.user!.id.slice(0, 8)}`;

      const organization = await prisma.organization.create({
        data: {
          name: orgName,
          slug: slug,
          members: {
            create: {
              userId: session!.user!.id,
              role: 'owner'
            }
          }
        }
      });

      membership = await prisma.membership.findFirst({
        where: { userId: session!.user!.id },
        include: { organization: true }
      });
    }

    // Create the deal with both userId and organizationId
    const deal = await prisma.deal.create({
      data: {
        name: name.trim(),
        userId: session!.user!.id,
        organizationId: membership!.organizationId,
      },
    });

    redirect(`/app/deals/${deal.id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            href="/app/deals"
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition group"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Deal</h1>
            <p className="text-gray-600 mt-1">Add a new opportunity to analyze</p>
          </div>
        </div>

        {/* Form */}
        <form action={createDeal} className="bg-white rounded-2xl border-2 border-gray-200 p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deal Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g., Main Street Coffee Shop Acquisition"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
            <p className="mt-1 text-sm text-gray-500">
              Give your deal a descriptive name to easily identify it later
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Link
              href="/app/deals"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition text-gray-700 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Create Deal
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
          <h3 className="text-lg font-semibold text-emerald-900 mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm text-emerald-800">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Your deal will be created and you'll be taken to the deal overview page</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>You can start running analyses using our powerful calculators</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>All your analyses will be saved and you can come back anytime</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}