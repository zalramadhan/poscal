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
  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) {
    throw { statusCode: 401, message: 'Tenant ID not found in context' }
  }
  return tenantId
}

export async function getUserId(request: NextRequest): Promise<string> {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    throw { statusCode: 401, message: 'User ID not found in context' }
  }
  return userId
}

export async function getRoleId(request: NextRequest): Promise<string | null> {
  return request.headers.get('x-role-id')
}

export async function getBranchId(request: NextRequest): Promise<string | null> {
  return request.headers.get('x-branch-id')
}

export function validateSchema<T>(schema: ZodType<T, any, any>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
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
      return await handler(...args)
    } catch (error: any) {
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
