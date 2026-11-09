export interface ApiEnvelope<T> {
  status: string
  message?: string
  data: T
}

export interface Product {
  id: number
  title: string
  price: number
}

export interface CartItem {
  id: number
  title: string
  price: number
  count: number
}

export interface OrderProduct {
  id: string
  title: string
  price: number
  quantity: number
}

export interface Order {
  id: number
  full_price: number
  count: number
  products: OrderProduct[]
  /** В спецификации не описаны, но могут прийти с бэкенда. */
  status?: number
  created_at?: string
}

export interface PaymentMethod {
  id: number
  title: string
}

export interface Credentials {
  email: string
  password: string
}

export interface RegistrationPayload extends Credentials {
  name: string
  password_confirmation: string
}

export interface AuthResult {
  id: number
  token: string
}

export type OrderStatus = 1 | 2 | 3

export type SortDirection = 'asc' | 'desc'
