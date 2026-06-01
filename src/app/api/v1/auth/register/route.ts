import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { auth, BetterAuthError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { name, email, password, storeName } = body

    if (!name || !email || !password || !storeName) {
      return errorResponse('Name, email, password, dan storeName diperlukan', 400)
    }

    if (password.length < 8) {
      return errorResponse('Password minimal 8 karakter, harus ada huruf dan angka', 400)
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return errorResponse('Email sudah terdaftar', 400)
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await prisma.$transaction(async (tx) => {
      const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      const existingSlug = await tx.tenant.findUnique({ where: { slug } })
      const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug

      const tenant = await tx.tenant.create({
        data: {
          name: storeName,
          slug: finalSlug,
          email,
          status: 'active',
        },
      })

      const adminRole = await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: 'admin',
          description: 'Administrator role with full access',
        },
      })

      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          tenantId: tenant.id,
          roleId: adminRole.id,
          status: 'ACTIVE',
        },
      })

      return { tenant, user, role: adminRole }
    })

    return successResponse({
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        tenantId: result.tenant.id,
        role: result.role.name,
      },
      session: { token: 'manual-session' },
    }, 'Registration successful')
  } catch (error) {
    if (error instanceof BetterAuthError) {
      return errorResponse(error.message, 400)
    }
    console.error('[Register Error]', error)
    return errorResponse('Internal server error', 500)
  }
}