import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { ensureUserHasFirstDeal } from "@/lib/services/onboarding";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // ✅ MOVE DB LOGIC TO EVENTS (CORRECT PLACE)
  events: {
    async signIn({ user }) {
      if (!user?.id) return;
      await ensureUserHasFirstDeal(user.id);
    },
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.plan = (user as any).plan || "free";
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
