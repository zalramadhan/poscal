import { NextRequest } from 'next/server'
import { successResponse, paginatedResponse } from '@/lib/api-response'
import { getTenantId, parseSearchParams, parseBody, withErrorHandler } from '@/lib/api-handler'
import { productService } from '@/lib/services/product.service'
import { inventoryRepository } from '@/modules/inventory/repositories/inventory.repository'
import { productSchema, productQuerySchema } from '@/validators/product'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)

  const url = new URL(request.url)
  const includeStock = url.searchParams.get('includeStock') === 'true'
  const warehouseId = url.searchParams.get('warehouseId')

  if (includeStock && warehouseId) {
    const products = await inventoryRepository.getProductsWithStock(tenantId, warehouseId)
    return successResponse(products)
  }

  const params = await parseSearchParams(request)
  const query = validateSchema(productQuerySchema, { ...params, page: params.page || '1', limit: params.limit || '10' })
  const result = await productService.list(tenantId, query)
  return paginatedResponse(result.data, result.pagination)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)
  const input = validateSchema(productSchema, body)
  const product = await productService.create(tenantId, userId, input)
  return successResponse(product, 'Product created', 201)
})
