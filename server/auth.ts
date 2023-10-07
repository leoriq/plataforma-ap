import { PrismaAdapter } from '@next-auth/prisma-adapter'
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  User,
} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from 'server/db'
import type { User as UserDB } from '@prisma/client'
import { compare } from 'bcrypt'

declare module 'next-auth' {
  interface User extends UserDB {
    password: undefined
  }
  interface Session extends DefaultSession {
    user: User
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
    signOut: '/signout',
  },
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Sign in',
      credentials: {
        email: {},
        password: {},
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
          ...user,
          password: undefined,
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
    jwt: async ({ token, user }) => {
      if (user) {
        return {
          ...token,
          user,
        }
      }

      const tokenUser = token.user as User

      const userDb = await prisma.user.findFirst({
        where: {
          id: token.sub,
          accessToken: tokenUser.accessToken,
        },
      })

      if (!userDb) {
        throw new Error('Unauthorized')
      }

      return {
        ...token,
        user: { ...userDb, password: undefined },
      }
    },
  },
}

export const getServerAuthSession = () => {
  return getServerSession(authOptions)
}
