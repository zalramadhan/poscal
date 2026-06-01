import { NextRequest } from 'next/server'
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const POST = async (request: NextRequest) => {
  try {
    const tenantId = request.headers.get('x-tenant-id')
    const userId = request.headers.get('x-user-id')

    if (!tenantId || !userId) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { email, roleId, branchId } = body

    if (!email || !roleId) {
      return errorResponse('Email dan roleId diperlukan', 400)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })

    if (!user || user.role.name !== 'admin') {
      return forbiddenResponse('Hanya admin yang bisa mengundang')
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return errorResponse('Email sudah terdaftar', 400)
    }

    const existingInvite = await prisma.invitation.findFirst({
      where: {
        email,
        tenantId,
        status: 'PENDING',
      },
    })

    if (existingInvite) {
      return errorResponse('Invite sudah dikirim ke email ini', 400)
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const invitation = await prisma.invitation.create({
      data: {
        tenantId,
        email,
        roleId,
        branchId: branchId || null,
        token,
        status: 'PENDING',
        expiresAt,
        invitedBy: userId,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/invite/accept?token=${token}`

    return successResponse({
      invitationId: invitation.id,
      inviteLink,
      expiresAt: invitation.expiresAt,
    }, 'Invitation created')
  } catch (error) {
    console.error('[Invite Error]', error)
    return errorResponse('Internal server error', 500)
  }
}