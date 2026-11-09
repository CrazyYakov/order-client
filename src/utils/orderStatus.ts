import type { OrderStatus } from '@/api/types'

export interface OrderStatusMeta {
  label: string
  tone: 'warning' | 'success' | 'danger' | 'neutral'
}

const STATUS_META: Record<number, OrderStatusMeta> = {
  1: { label: 'На оплату', tone: 'warning' },
  2: { label: 'Оплачен', tone: 'success' },
  3: { label: 'Отменён', tone: 'danger' },
}

export function orderStatusMeta(status?: number): OrderStatusMeta {
  if (status === undefined) return { label: 'Без статуса', tone: 'neutral' }
  return STATUS_META[status] ?? { label: `Статус ${status}`, tone: 'neutral' }
}

export const orderStatusOptions: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Все' },
  { value: 1, label: 'На оплату' },
  { value: 2, label: 'Оплачен' },
  { value: 3, label: 'Отменён' },
]
