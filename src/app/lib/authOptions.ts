import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface User {
    authority?: number;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      authority?: number;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // GitHub 로그인
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    // Credentials 로그인
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.member.findUnique({
          where: {
            id: Number(credentials.username), // Convert username to number to match Prisma schema
          },
        });

        if (!user) return null;

        // 비밀번호 확인 (여기선 단순 비교, 실환경에서는 bcrypt 등 사용 권장)
        if (user.password !== credentials.password) return null;

        return {
          id: String(user.id),
          name: user.user_nickname,
          email: user.email,
          authority: user.authority,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.authority = user.authority;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.authority = token.authority as number;
      }
      return session;
    },
  },
};
