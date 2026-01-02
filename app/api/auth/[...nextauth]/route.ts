import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import { ensureUserHasFirstDeal } from '@/lib/services/onboarding';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.plan = (user as any).plan || 'free';
        
        // Auto-create first deal on session creation
        await ensureUserHasFirstDeal(user.id);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After successful sign in, redirect to signin-redirect handler
      if (url.startsWith(baseUrl + '/api/auth/callback')) {
        return `${baseUrl}/api/auth/signin-redirect`;
      }
      // Allow redirect to any path on the base URL
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default to base URL
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
