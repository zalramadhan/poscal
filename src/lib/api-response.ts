import { NextResponse } from 'next/server'
import type { ApiResponse, PaginatedResponse } from '@/types'

export function successResponse<T>(data: T, message?: string, status = 200) {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
  }
  return NextResponse.json(body, { status })
}

export function paginatedResponse<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number; totalPages: number },
) {
  const body: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
  }
  return NextResponse.json(body)
}

export function errorResponse(
  message: string,
  status = 400,
  errors?: Record<string, string>,
) {
  const body: ApiResponse = {
    success: false,
    message,
    errors,
  }
  return NextResponse.json(body, { status })
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(message, 401)
}

export function forbiddenResponse(message = 'Forbidden') {
  return errorResponse(message, 403)
}

export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404)
}

export function validationErrorResponse(
  errors: Record<string, string>,
  message = 'Validation failed',
) {
  return errorResponse(message, 422, errors)
}

export function serverErrorResponse(error?: unknown) {
  console.error('[API Error]', error)
  return errorResponse('Internal server error', 500)
}
