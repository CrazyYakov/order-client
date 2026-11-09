import { apiRequest } from './client'
import type { ApiEnvelope } from './types'

export interface PaymentUrl {
  url: string
}

/** Подтверждение оплаты по токену, полученному от банка. */
export async function generatePaymentUrl(
  method: 'alpha_bank' | 'beta_bank',
  token: string,
): Promise<PaymentUrl> {
  const response = await apiRequest<ApiEnvelope<PaymentUrl>>(
    `/api/payment/payment/generate/url/${method}`,
    { query: { token } },
  )
  return response.data
}
