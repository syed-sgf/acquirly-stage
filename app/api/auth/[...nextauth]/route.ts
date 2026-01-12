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
    /**
     * Persist user identity in JWT
     * This runs on initial sign-in and subsequent requests
     */
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.plan = (user as any).plan || 'free';
      }
      return token;
    },

    /**
     * Expose user identity on the session
     * Required for RBAC
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.plan = (token.plan as string) || 'free';
      }
      return session;
    },

    /**
     * SAFE redirect logic — prevents OAuth loops
     */
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
