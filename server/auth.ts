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
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface User extends UserDB {
    password: undefined
  }
  interface Session extends DefaultSession {
    user: User
    validatedAt: string
  }
}
declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    user: User
    validatedAt: string
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
    signOut: '/signout',
  },
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
          validatedAt: new Date().toISOString(),
          user,
        }
      }

      if (
        token.validatedAt &&
        new Date(token.validatedAt) >
          new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
      ) {
        return token
      }

      const userDb = await prisma.user.findFirst({
        where: {
          id: token.sub,
          accessToken: token.user.accessToken,
        },
      })

      if (!userDb) {
        throw new Error('Unauthorized')
      }

      return {
        ...token,
        validatedAt: new Date().toISOString(),
        user: { ...userDb, password: undefined },
      }
    },
  },
}

export const getServerAuthSession = () => {
  return getServerSession(authOptions)
}
