import { apiRequest } from './client'
import type { ApiEnvelope, CartItem, PaymentMethod } from './types'

export async function fetchCart(): Promise<CartItem[]> {
  const response = await apiRequest<ApiEnvelope<CartItem[]>>('/api/carts')
  return response.data ?? []
}

export async function addToCart(productId: number): Promise<void> {
  await apiRequest<ApiEnvelope<null>>(`/api/carts/${productId}`, { method: 'POST' })
}

export async function removeFromCart(productId: number): Promise<void> {
  await apiRequest<ApiEnvelope<null>>(`/api/carts/${productId}`, { method: 'DELETE' })
}

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await apiRequest<ApiEnvelope<PaymentMethod[]>>('/api/payment/methods')
  return response.data ?? []
}

/** Возвращает ссылку на оплату, если бэкенд её вернул. */
export async function payCart(paymentMethodId: number): Promise<string | null> {
  const response = await apiRequest<ApiEnvelope<unknown>>(`/api/carts/pay/${paymentMethodId}`, {
    method: 'POST',
  })
  const data = response.data
  if (typeof data === 'string' && data) return data
  if (data && typeof data === 'object' && 'url' in data) {
    const url = (data as { url?: unknown }).url
    if (typeof url === 'string' && url) return url
  }
  return null
}
