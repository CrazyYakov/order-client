import { apiRequest } from './client'
import type { ApiEnvelope, Order, OrderStatus, SortDirection } from './types'

export interface OrderQuery {
  filter_status?: OrderStatus | ''
  sort_created_at?: SortDirection | ''
}

export async function fetchOrders(query: OrderQuery = {}): Promise<Order[]> {
  const response = await apiRequest<ApiEnvelope<Order[]>>('/api/orders', {
    query: {
      filter_status: query.filter_status || undefined,
      sort_created_at: query.sort_created_at || undefined,
    },
  })
  return response.data ?? []
}

export async function fetchOrder(id: number): Promise<Order> {
  const response = await apiRequest<ApiEnvelope<Order>>(`/api/orders/${id}`)
  return response.data
}

export async function markOrderAsPaid(id: number): Promise<void> {
  await apiRequest<ApiEnvelope<null>>(`/api/orders/payed/${id}`, { method: 'POST' })
}
