import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { auth, BetterAuthError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return errorResponse('Email dan password diperlukan', 400)
    }

    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: request.headers,
    } as any) as any

    if (!result?.user) {
      return errorResponse('Email atau password salah', 401)
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, tenantId: true, roleId: true, branchId: true },
    })

    return successResponse({
      user,
      session: { token: result.token || 'session' },
    }, 'Login successful')
  } catch (error) {
    console.error('[Login Error]', error)
    if (error instanceof BetterAuthError) {
      return errorResponse('Email atau password salah', 401)
    }
    return errorResponse('Internal server error', 500)
  }
}