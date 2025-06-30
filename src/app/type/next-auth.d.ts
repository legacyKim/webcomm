// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // id 추가
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string; // User에도 id 추가 (jwt 토큰 등에서 사용하려면)
  }
}
