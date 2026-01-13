import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.plan = (user as any).plan || 'free';
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.plan = (token.plan as string) || 'free';
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allow relative URLs (like /app/deals/new)
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Allow absolute URLs that match our domain
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Default to /app for safety
      return `${baseUrl}/app`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
