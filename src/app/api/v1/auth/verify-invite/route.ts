import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return errorResponse('Token diperlukan', 400)
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        tenant: { select: { id: true, name: true, slug: true } },
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

    return successResponse({
      email: invitation.email,
      tenantName: invitation.tenant.name,
      roleName: invitation.role.name,
      expiresAt: invitation.expiresAt,
    }, 'Invitation valid')
  } catch (error) {
    console.error('[Verify Invite Error]', error)
    return errorResponse('Internal server error', 500)
  }
}