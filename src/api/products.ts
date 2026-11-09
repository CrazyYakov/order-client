import { apiRequest } from './client'
import type { ApiEnvelope, Product, SortDirection } from './types'

export interface ProductQuery {
  search?: string
  filter_price?: number | null
  sort_price_dir?: SortDirection | ''
}

export async function fetchProducts(query: ProductQuery = {}): Promise<Product[]> {
  const response = await apiRequest<ApiEnvelope<Product[]>>('/api/products', {
    query: {
      search: query.search?.trim() || undefined,
      filter_price: query.filter_price ?? undefined,
      sort_price_dir: query.sort_price_dir || undefined,
    },
  })
  return response.data ?? []
}

export async function fetchProduct(id: number): Promise<Product> {
  const response = await apiRequest<ApiEnvelope<Product>>(`/api/products/${id}`)
  return response.data
}
