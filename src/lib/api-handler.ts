// ──────────────────────────────────────────────────────
// POS AI - API Handler Utilities
// ──────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import { ZodError, ZodType } from 'zod'
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, paginatedResponse } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'

type HandlerContext = {
  params: Promise<Record<string, string>>
}

export async function getTenantId(request: NextRequest): Promise<string> {
  // In production, extract from auth session
  // For now, get from header or first tenant in DB
  const headerId = request.headers.get('x-tenant-id')
  if (headerId) return headerId

  // Fallback: fetch first tenant from database
  const tenant = await prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' } })
  if (tenant) return tenant.id

  // Last resort fallback (development only)
  return 'default'
}

export async function getUserId(request: NextRequest): Promise<string> {
  const userId = request.headers.get('x-user-id') || 'system'
  return userId
}

export function validateSchema<T>(schema: ZodType<T, any, any>, data: unknown): T {
  console.log('[validateSchema] data:', JSON.stringify(data))
  try {
    return schema.parse(data)
  } catch (error) {
    console.error('[validateSchema] error:', error)
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((e) => {
        const path = e.path.join('.')
        errors[path] = e.message
      })
      throw { validation: true, errors, message: 'Validation failed' }
    }
    throw error
  }
}

export function withErrorHandler(handler: Function) {
  return async (...args: unknown[]) => {
    try {
      console.log('[withErrorHandler] calling handler at', new Date().toISOString())
      const result = await handler(...args)
      console.log('[withErrorHandler] handler returned successfully')
      return result
    } catch (error: any) {
      console.error('[withErrorHandler] CAUGHT ERROR:', error?.message || error)
      console.error('[withErrorHandler] error type:', error?.constructor?.name)
      console.error('[withErrorHandler] error stack:', error?.stack)
      console.error('[withErrorHandler] full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
      if (error?.validation) {
        return errorResponse(error.message, 422, error.errors)
      }
      if (error?.statusCode) {
        return errorResponse(error.message, error.statusCode)
      }
      return serverErrorResponse(error)
    }
  }
}

export async function parseBody<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json()
  } catch {
    throw { validation: true, message: 'Invalid JSON body' }
  }
}

export async function parseSearchParams(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => { params[key] = value })
  return params
}
