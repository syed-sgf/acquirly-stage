export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Briefcase, 
  CheckCircle2, 
  Calculator, 
  TrendingUp, 
  FileText,
  Sparkles 
} from 'lucide-react';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now();
}

async function createDeal(formData: FormData) {
  'use server';
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/');
  }

  const name = formData.get('name') as string;
  
  if (!name || name.trim().length === 0) {
    throw new Error('Deal name is required');
  }

  // Get user's organization membership
  let membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });

  // If no organization exists, create a default one for this user
  if (!membership) {
    const orgName = `${session.user.name || 'My'}'s Organization`;
    const org = await prisma.organization.create({
      data: {
        name: orgName,
        slug: generateSlug(orgName),
      },
    });
    
    membership = await prisma.membership.create({
      data: {
        userId: session.user.id,
        organizationId: org.id,
        role: 'owner',
      },
      include: { organization: true },
    });
  }

  const deal = await prisma.deal.create({
    data: {
      name: name.trim(),
      userId: session.user.id,
      organizationId: membership.organizationId,
    },
  });

  redirect(`/app/deals/${deal.id}`);
}

export default async function NewDealPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sgf-green-50/30">
      <div className="bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sgf-gold-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 relative z-10">
          <Link
            href="/app/deals"
            className="inline-flex items-center gap-2 text-sgf-green-100 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Deals
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Briefcase className="w-7 h-7 text-sgf-gold-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Create New Deal</h1>
              <p className="text-sgf-green-100 mt-1">Start analyzing a new business acquisition opportunity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-6 pb-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sgf-green-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-sgf-green-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Deal Information</h2>
                    <p className="text-sm text-gray-500">Enter the basic details to get started</p>
                  </div>
                </div>
              </div>

              <form action={createDeal} className="p-6 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Deal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="e.g., Main Street Coffee Shop Acquisition"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sgf-green-500/20 focus:border-sgf-green-500 transition-all outline-none text-gray-900 placeholder:text-gray-400"
                  />
                  <p className="mt-2 text-sm text-gray-500">Give your deal a descriptive name to easily identify it later</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <Link
                    href="/app/deals"
                    className="w-full sm:w-auto px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-sgf-green-500 hover:bg-sgf-green-50 transition-all text-gray-700 font-semibold text-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 hover:from-sgf-green-600 hover:to-sgf-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Create Deal
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-sgf-green-500 to-sgf-green-600 px-5 py-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sgf-gold-400" />
                  What Happens Next?
                </h3>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-sgf-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sgf-green-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Deal Created</p>
                    <p className="text-xs text-gray-500 mt-0.5">Your deal workspace will be ready instantly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-sgf-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sgf-green-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Run Analyses</p>
                    <p className="text-xs text-gray-500 mt-0.5">Use our powerful calculators to analyze the opportunity</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-sgf-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sgf-green-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Auto-Save</p>
                    <p className="text-xs text-gray-500 mt-0.5">All your analyses are saved automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-sgf-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sgf-gold-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Export Reports</p>
                    <p className="text-xs text-gray-500 mt-0.5">Generate professional PDFs for stakeholders</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div className="p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Available Tools</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calculator className="w-4 h-4 text-sgf-green-500" />
                    <span>DSCR Calculator</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 text-sgf-green-500" />
                    <span>Business Acquisition Analyzer</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-sgf-green-500" />
                    <span>Business Valuation Tools</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4 text-sgf-green-500" />
                    <span>PDF Report Generation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-sgf-green-600 to-sgf-green-700 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sgf-gold-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Need Financing for Your Acquisition?</h3>
              <p className="text-sgf-green-100">Starting Gate Financial offers SBA 7(a) loans, seller financing structures, and more.</p>
            </div>
            <a
              href="https://startinggatefinancial.com/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 bg-sgf-gold-500 hover:bg-sgf-gold-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Apply for Financing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
