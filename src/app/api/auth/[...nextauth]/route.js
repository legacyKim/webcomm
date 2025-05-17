import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/app/lib/prisma'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.member.findUnique({
          where: {
            user_id: credentials.username
          }
        })

        if (user && user.password === credentials.password) {
          return {
            id: user.user_id,
            name: user.user_nickname,
            email: user.email
          }
        }
        return null
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/login'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 