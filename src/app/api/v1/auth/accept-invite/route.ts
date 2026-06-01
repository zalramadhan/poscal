import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { token, password, name } = body

    if (!token || !password || !name) {
      return errorResponse('Token, password, dan name diperlukan', 400)
    }

    if (password.length < 8) {
      return errorResponse('Password minimal 8 karakter, harus ada huruf dan angka', 400)
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        tenant: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
      },
    })

    if (!invitation) {
      return errorResponse('Link invalid', 400)
    }

    if (invitation.status === 'ACCEPTED') {
      return errorResponse('Link sudah digunakan', 400)
    }

    if (invitation.status === 'EXPIRED' || invitation.expiresAt < new Date()) {
      return errorResponse('Link expired, minta invite ulang ke admin', 400)
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    })

    if (existingUser) {
      return errorResponse('Email sudah terdaftar', 400)
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: invitation.email,
          passwordHash,
          tenantId: invitation.tenantId,
          roleId: invitation.roleId,
          branchId: invitation.branchId,
          status: 'ACTIVE',
        },
      })

      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      })

      return user
    })

    const sessionResult = await auth.api.signUpEmail({
      body: { name, email: invitation.email, password },
      headers: request.headers,
    } as any) as any

    return successResponse({
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        tenantId: result.tenantId,
        roleId: result.roleId,
      },
      session: { token: sessionResult.token },
    }, 'Account created successfully')
  } catch (error) {
    console.error('[Accept Invite Error]', error)
    return errorResponse('Internal server error', 500)
  }
}