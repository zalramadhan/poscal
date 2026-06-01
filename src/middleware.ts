import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export interface AuthContext {
  userId: string
  tenantId: string
  roleId: string
  branchId: string | null
}

const PUBLIC_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/verify-invite',
  '/api/v1/auth/accept-invite',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path))
  if (isPublicPath) {
    return NextResponse.next()
  }

  if (!pathname.startsWith('/api/v1/')) {
    return NextResponse.next()
  }

  const sessionToken = request.cookies.get('better-auth.session_token')?.value
  if (!sessionToken) {
    return NextResponse.json(
      { success: false, message: 'Sesi expired, silakan login ulang' },
      { status: 401 }
    )
  }

  try {
    const sessionResult = await auth.api.getSession({
      headers: request.headers,
    } as any)

    if (!sessionResult) {
      return NextResponse.json(
        { success: false, message: 'Sesi expired, silakan login ulang' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionResult.user.id },
      select: { id: true, tenantId: true, roleId: true, branchId: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 401 }
      )
    }

    const headers = new Headers(request.headers)
    headers.set('x-user-id', user.id)
    headers.set('x-tenant-id', user.tenantId)
    headers.set('x-role-id', user.roleId)
    if (user.branchId) {
      headers.set('x-branch-id', user.branchId)
    }

    return NextResponse.next({ request: { headers } })
  } catch (error) {
    console.error('[Middleware Error]', error)
    return NextResponse.json(
      { success: false, message: 'Sesi expired, silakan login ulang' },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: ['/api/v1/:path*'],
}