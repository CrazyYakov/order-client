<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { fetchOrder, markOrderAsPaid } from '@/api/orders'
import type { Order } from '@/api/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import StatusBadge from '@/components/order/StatusBadge.vue'
import ProductThumb from '@/components/product/ProductThumb.vue'
import { useToasts } from '@/stores/toast'
import { formatDate, formatPrice, pluralize } from '@/utils/format'

const route = useRoute()
const toasts = useToasts()

const order = ref<Order | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const paying = ref(false)

const orderId = computed(() => Number(route.params.id))
const canPay = computed(() => order.value?.status === 1)

async function load(): Promise<void> {
  const id = orderId.value
  if (!Number.isInteger(id) || id <= 0) {
    error.value = 'Некорректный номер заказа'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null
  try {
    order.value = await fetchOrder(id)
  } catch (e) {
    order.value = null
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить заказ'
  } finally {
    loading.value = false
  }
}

async function markPaid(): Promise<void> {
  if (!order.value) return

  paying.value = true
  try {
    await markOrderAsPaid(order.value.id)
    toasts.success('Заказ отмечен как оплаченный')
    await load()
  } catch (e) {
    toasts.error(e instanceof Error ? e.message : 'Не удалось обновить статус')
  } finally {
    paying.value = false
  }
}

onMounted(load)
watch(orderId, load)
</script>

<template>
  <section>
    <RouterLink :to="{ name: 'orders' }" class="back">← К заказам</RouterLink>

    <div v-if="loading" class="stack">
      <BaseSkeleton height="88px" radius="16px" />
      <BaseSkeleton height="180px" radius="16px" />
    </div>

    <ErrorState
      v-else-if="error"
      title="Заказ недоступен"
      :message="error"
      retryable
      @retry="load"
    />

    <template v-else-if="order">
      <div class="head surface">
        <div>
          <h1 class="head__title">Заказ №{{ order.id }}</h1>
          <p class="muted head__meta">
            {{ order.count }} {{ pluralize(order.count, 'товар', 'товара', 'товаров') }}
            <template v-if="order.created_at"> · {{ formatDate(order.created_at) }}</template>
          </p>
        </div>
        <StatusBadge :status="order.status" />
      </div>

      <div class="layout">
        <div class="surface products">
          <h2 class="products__title">Состав заказа</h2>
          <ul class="products__list">
            <li v-for="item in order.products" :key="item.id" class="product">
              <RouterLink
                :to="{ name: 'product', params: { id: Number(item.id) } }"
                class="product__media"
              >
                <ProductThumb :id="Number(item.id)" :title="item.title" size="sm" />
              </RouterLink>

              <div class="product__info">
                <RouterLink
                  :to="{ name: 'product', params: { id: Number(item.id) } }"
                  class="product__title"
                >
                  {{ item.title }}
                </RouterLink>
                <span class="muted product__unit">
                  {{ formatPrice(item.price) }} × {{ item.quantity }}
                </span>
              </div>

              <span class="price">{{ formatPrice(item.price * item.quantity) }}</span>
            </li>
          </ul>
        </div>

        <aside class="summary surface">
          <h2 class="summary__title">Оплата</h2>
          <div class="summary__row">
            <span class="muted">Товары ({{ order.count }})</span>
            <span class="price">{{ formatPrice(order.full_price) }}</span>
          </div>
          <div class="summary__row summary__row--total">
            <span>Итого</span>
            <span class="price">{{ formatPrice(order.full_price) }}</span>
          </div>

          <BaseButton
            v-if="canPay"
            block
            :loading="paying"
            @click="markPaid"
          >
            Отметить оплаченным
          </BaseButton>
          <p v-else-if="order.status === 2" class="summary__note summary__note--success">
            Заказ оплачен
          </p>
          <p v-else-if="order.status === 3" class="summary__note summary__note--danger">
            Заказ отменён
          </p>
        </aside>
      </div>
    </template>
  </section>
</template>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text-muted);
}

.back:hover {
  color: var(--c-accent);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  margin-bottom: 20px;
}

.head__title {
  font-size: 22px;
}

.head__meta {
  font-size: 13.5px;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;
  align-items: start;
}

.products {
  padding: 20px;
}

.products__title {
  font-size: 17px;
  margin-bottom: 14px;
}

.products__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
  padding: 0;
}

.product {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
}

.product__media {
  width: 52px;
}

.product__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.product__title {
  color: var(--c-text);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product__title:hover {
  color: var(--c-accent);
}

.product__unit {
  font-size: 13px;
}

.summary {
  position: sticky;
  top: calc(var(--header-height) + 16px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

.summary__title {
  font-size: 17px;
}

.summary__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
}

.summary__row--total {
  padding-top: 10px;
  border-top: 1px solid var(--c-border);
  font-size: 16px;
  font-weight: 600;
}

.summary__note {
  font-size: 13.5px;
  font-weight: 600;
  text-align: center;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
}

.summary__note--success {
  background: var(--c-success-soft);
  color: var(--c-success);
}

.summary__note--danger {
  background: var(--c-danger-soft);
  color: var(--c-danger);
}

@media (max-width: 820px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .summary {
    position: static;
  }
}
</style>
