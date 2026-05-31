import { betterAuth } from 'better-auth'
import { prisma } from '@/lib/prisma'

export const auth = betterAuth({
  database: prisma,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    modelName: 'User',
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
