import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { DEMO_USER_EMAIL, DEMO_USER_ID, isDemoMode } from "@/lib/demo-mode";
import { loginSchema } from "@/lib/validators";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        demo: { label: "Demo", type: "text" }
      },
      async authorize(credentials) {
        if (credentials?.demo === "true" && isDemoMode()) {
          return {
            id: DEMO_USER_ID,
            email: DEMO_USER_EMAIL
          };
        }

        if (isDemoMode()) {
          return null;
        }

        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const db = getDb();
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            passwordHash: users.passwordHash
          })
          .from(users)
          .where(eq(users.email, parsed.data.email))
          .limit(1);

        if (!user) {
          return null;
        }

        const passwordMatches = await compare(parsed.data.password, user.passwordHash);

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }

      return session;
    }
  }
};

export async function getCurrentUser() {
  const cookieStore = await cookies();

  if (isDemoMode()) {
    if (cookieStore.get("expense-demo-session")?.value === "true") {
      return { id: DEMO_USER_ID, email: DEMO_USER_EMAIL };
    }
    return null;
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  return user;
}
