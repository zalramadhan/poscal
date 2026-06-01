import { betterAuth, BetterAuthError } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/prisma'

export { BetterAuthError }

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    passwordStrength: {
      minLength: 8,
      requireLetter: true,
      requireNumber: true,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    modelName: 'user',
    fields: {
      email: 'email',
      name: 'name',
      emailVerified: 'emailVerified',
    },
  },
  rateLimit: {
    window: 60,
    max: 10,
  },
})

export type AuthSession = typeof auth.$Infer.Session