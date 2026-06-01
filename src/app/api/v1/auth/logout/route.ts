import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { auth } from '@/lib/auth'

export const POST = async (request: NextRequest) => {
  try {
    const sessionToken = request.cookies.get('better-auth.session_token')?.value

    if (sessionToken) {
      await auth.api.signOut({
        body: { token: sessionToken },
        headers: request.headers,
      } as any)
    }

    return successResponse(null, 'Logged out successfully')
  } catch (error) {
    console.error('[Logout Error]', error)
    return successResponse(null, 'Logged out successfully')
  }
}