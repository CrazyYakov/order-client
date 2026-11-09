<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { fetchOrders } from '@/api/orders'
import type { Order, OrderStatus, SortDirection } from '@/api/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import StatusBadge from '@/components/order/StatusBadge.vue'
import { orderStatusOptions } from '@/utils/orderStatus'
import { formatDate, formatPrice, pluralize } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const statusFilter = ref<OrderStatus | ''>('')
const sortDir = ref<SortDirection>('desc')

const sortOptions: { value: SortDirection; label: string }[] = [
  { value: 'desc', label: 'Сначала новые' },
  { value: 'asc', label: 'Сначала старые' },
]

const isEmpty = computed(() => !loading.value && !error.value && orders.value.length === 0)

function readStatus(): OrderStatus | '' {
  const raw = route.query.status
  const value = Number(raw)
  return value === 1 || value === 2 || value === 3 ? value : ''
}

function readSort(): SortDirection {
  return route.query.sort === 'asc' ? 'asc' : 'desc'
}

function syncFromRoute(): void {
  statusFilter.value = readStatus()
  sortDir.value = readSort()
}

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    orders.value = await fetchOrders({
      filter_status: statusFilter.value,
      sort_created_at: sortDir.value,
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить заказы'
  } finally {
    loading.value = false
  }
}

function updateQuery(): void {
  const query: Record<string, string> = {}
  if (statusFilter.value) query.status = String(statusFilter.value)
  if (sortDir.value !== 'desc') query.sort = sortDir.value
  void router.replace({ name: 'orders', query })
}

watch([statusFilter, sortDir], updateQuery)

watch(
  () => route.query,
  () => {
    syncFromRoute()
    void load()
  },
)

onMounted(() => {
  syncFromRoute()
  void load()
})
</script>

<template>
  <section>
    <h1 class="page-title">Мои заказы</h1>
    <p class="page-subtitle">История заказов и их текущий статус</p>

    <div class="toolbar surface">
      <div class="toolbar__group">
        <span class="toolbar__label">Статус</span>
        <div class="segmented">
          <button
            v-for="option in orderStatusOptions"
            :key="String(option.value)"
            class="segmented__btn"
            :class="{ 'segmented__btn--active': statusFilter === option.value }"
            type="button"
            @click="statusFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="toolbar__group">
        <span class="toolbar__label">Сортировка</span>
        <div class="segmented">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            class="segmented__btn"
            :class="{ 'segmented__btn--active': sortDir === option.value }"
            type="button"
            @click="sortDir = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="list">
      <BaseSkeleton v-for="n in 3" :key="n" height="120px" radius="16px" />
    </div>

    <ErrorState
      v-else-if="error"
      class="mt"
      title="Не удалось загрузить заказы"
      :message="error"
      retryable
      @retry="load"
    />

    <EmptyState
      v-else-if="isEmpty"
      class="mt"
      icon="📦"
      title="Заказов пока нет"
      description="Оформите первый заказ — он появится в этом списке."
    >
      <RouterLink :to="{ name: 'catalog' }">
        <BaseButton>В каталог</BaseButton>
      </RouterLink>
    </EmptyState>

    <ul v-else class="list">
      <li v-for="order in orders" :key="order.id" class="order surface">
        <div class="order__head">
          <div>
            <RouterLink :to="{ name: 'order', params: { id: order.id } }" class="order__link">
              Заказ №{{ order.id }}
            </RouterLink>
            <p class="muted order__meta">
              {{ order.count }} {{ pluralize(order.count, 'товар', 'товара', 'товаров') }}
              <template v-if="order.created_at"> · {{ formatDate(order.created_at) }}</template>
            </p>
          </div>
          <StatusBadge :status="order.status" />
        </div>

        <p class="order__products muted">
          {{ order.products.map((p) => `${p.title} × ${p.quantity}`).join(', ') }}
        </p>

        <div class="order__foot">
          <span class="price order__price">{{ formatPrice(order.full_price) }}</span>
          <RouterLink :to="{ name: 'order', params: { id: order.id } }" class="order__details">
            Подробнее →
          </RouterLink>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 14px 16px;
  margin-bottom: 20px;
}

.toolbar__group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toolbar__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-text-muted);
}

.segmented {
  display: inline-flex;
  padding: 3px;
  gap: 2px;
  background: var(--c-surface-2);
  border-radius: var(--radius-sm);
}

.segmented__btn {
  border: none;
  background: transparent;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-muted);
  white-space: nowrap;
}

.segmented__btn--active {
  background: var(--c-surface);
  color: var(--c-text);
  box-shadow: var(--shadow-sm);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
  padding: 0;
}

.order {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
}

.order__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.order__link {
  font-size: 16px;
  font-weight: 650;
  color: var(--c-text);
}

.order__link:hover {
  color: var(--c-accent);
}

.order__meta {
  font-size: 13px;
}

.order__products {
  font-size: 13.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.order__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--c-border);
}

.order__price {
  font-size: 17px;
}

.order__details {
  font-size: 14px;
  font-weight: 600;
}

.mt {
  margin-top: 20px;
}
</style>
