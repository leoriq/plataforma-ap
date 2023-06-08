import { PrismaAdapter } from '@next-auth/prisma-adapter'
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  User,
} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from 'server/db'
import { compare } from 'bcrypt'

declare module 'next-auth' {
  interface User {
    role: string
  }
  interface Session extends DefaultSession {
    user: User
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Sign in',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'example@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user?.password) {
          return null
        }

        if (!(await compare(credentials.password, user.password))) {
          return null
        }

        return {
          id: user.id,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      const user = token.user as User

      return {
        ...session,
        user,
      }
    },
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          user: user,
        }
      }
      return token
    },
  },
}

export const getServerAuthSession = () => {
  return getServerSession(authOptions)
}
