<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchPaymentMethods, payCart } from '@/api/cart'
import type { CartItem, PaymentMethod } from '@/api/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import QuantityStepper from '@/components/ui/QuantityStepper.vue'
import ProductThumb from '@/components/product/ProductThumb.vue'
import { useCart } from '@/stores/cart'
import { useToasts } from '@/stores/toast'
import { formatPrice, pluralize } from '@/utils/format'

const router = useRouter()
const cart = useCart()
const toasts = useToasts()

const methods = ref<PaymentMethod[]>([])
const methodsError = ref<string | null>(null)
const selectedMethod = ref<number | null>(null)
const paying = ref(false)
const busyId = ref<number | null>(null)

const items = computed(() => cart.state.items)
const total = computed(() => cart.total.value)
const count = computed(() => cart.count.value)
const loading = computed(() => cart.state.loading && items.value.length === 0)

onMounted(async () => {
  void cart.load().catch(() => undefined)

  try {
    methods.value = await fetchPaymentMethods()
    selectedMethod.value = methods.value[0]?.id ?? null
  } catch (e) {
    methodsError.value = e instanceof Error ? e.message : 'Не удалось получить способы оплаты'
  }
})

async function changeQuantity(item: CartItem, delta: number): Promise<void> {
  busyId.value = item.id
  try {
    if (delta > 0) await cart.add(item)
    else await cart.remove(item)
  } catch (e) {
    toasts.error(e instanceof Error ? e.message : 'Не удалось изменить количество')
    void cart.load().catch(() => undefined)
  } finally {
    busyId.value = null
  }
}

async function removeItem(item: CartItem): Promise<void> {
  busyId.value = item.id
  try {
    await cart.removeAll(item)
    toasts.success('Товар удалён из корзины')
  } catch (e) {
    toasts.error(e instanceof Error ? e.message : 'Не удалось удалить товар')
    void cart.load().catch(() => undefined)
  } finally {
    busyId.value = null
  }
}

async function pay(): Promise<void> {
  if (!selectedMethod.value) return

  paying.value = true
  try {
    const url = await payCart(selectedMethod.value)
    cart.clear()
    if (url) {
      toasts.success('Заказ создан, переходим к оплате')
      window.location.href = url
      return
    }
    toasts.success('Заказ создан. Ссылка на оплату придёт от банка')
    void router.push({ name: 'orders' })
  } catch (e) {
    toasts.error(e instanceof Error ? e.message : 'Не удалось оплатить корзину')
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <section>
    <h1 class="page-title">Корзина</h1>
    <p class="page-subtitle">
      {{ count }} {{ pluralize(count, 'товар', 'товара', 'товаров') }} к оплате
    </p>

    <div v-if="loading" class="stack">
      <BaseSkeleton v-for="n in 3" :key="n" height="96px" radius="16px" />
    </div>

    <ErrorState
      v-else-if="cart.state.error && items.length === 0"
      title="Не удалось загрузить корзину"
      :message="cart.state.error"
      retryable
      @retry="cart.load()"
    />

    <EmptyState
      v-else-if="items.length === 0"
      icon="🛒"
      title="Корзина пуста"
      description="Добавьте товары из каталога, чтобы оформить заказ."
    >
      <BaseButton @click="router.push({ name: 'catalog' })">Перейти в каталог</BaseButton>
    </EmptyState>

    <div v-else class="layout">
      <ul class="items">
        <li v-for="item in items" :key="item.id" class="item surface">
          <RouterLink :to="{ name: 'product', params: { id: item.id } }" class="item__media">
            <ProductThumb :id="item.id" :title="item.title" size="sm" />
          </RouterLink>

          <div class="item__info">
            <RouterLink :to="{ name: 'product', params: { id: item.id } }" class="item__title">
              {{ item.title }}
            </RouterLink>
            <span class="muted item__unit">{{ formatPrice(item.price) }} за шт.</span>
          </div>

          <QuantityStepper
            :value="item.count"
            :disabled="busyId === item.id"
            @decrease="changeQuantity(item, -1)"
            @increase="changeQuantity(item, 1)"
          />

          <span class="price item__sum">{{ formatPrice(item.price * item.count) }}</span>

          <div class="item__action">
            <BaseButton
              variant="ghost"
              size="sm"
              :disabled="busyId === item.id"
              @click="removeItem(item)"
            >
              Удалить
            </BaseButton>
          </div>
        </li>
      </ul>

      <aside class="summary surface">
        <h2 class="summary__title">Итого</h2>

        <dl class="summary__rows">
          <div class="summary__row">
            <dt>Товары ({{ count }})</dt>
            <dd>{{ formatPrice(total) }}</dd>
          </div>
          <div class="summary__row">
            <dt>Доставка</dt>
            <dd class="muted">Бесплатно</dd>
          </div>
          <div class="summary__row summary__row--total">
            <dt>К оплате</dt>
            <dd class="price">{{ formatPrice(total) }}</dd>
          </div>
        </dl>

        <div class="summary__methods">
          <p class="summary__label">Способ оплаты</p>

          <ErrorState
            v-if="methodsError"
            title="Способы оплаты недоступны"
            :message="methodsError"
          />

          <p v-else-if="methods.length === 0" class="muted">Нет доступных способов оплаты</p>

          <label v-for="method in methods" :key="method.id" class="method">
            <input
              v-model="selectedMethod"
              type="radio"
              name="payment-method"
              :value="method.id"
            />
            <span>{{ method.title }}</span>
          </label>
        </div>

        <BaseButton
          block
          :loading="paying"
          :disabled="!selectedMethod || items.length === 0"
          @click="pay"
        >
          Оплатить
        </BaseButton>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
  padding: 0;
}

.item {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto auto auto;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
}

.item__media {
  width: 64px;
}

.item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.item__title {
  color: var(--c-text);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item__title:hover {
  color: var(--c-accent);
}

.item__unit {
  font-size: 13px;
}

.item__sum {
  font-size: 16px;
  min-width: 100px;
  text-align: right;
}

.summary {
  position: sticky;
  top: calc(var(--header-height) + 16px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.summary__title {
  font-size: 18px;
}

.summary__rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}

.summary__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.summary__row dt {
  color: var(--c-text-muted);
}

.summary__row--total {
  padding-top: 10px;
  border-top: 1px solid var(--c-border);
  font-size: 16px;
  font-weight: 600;
}

.summary__row--total dt {
  color: var(--c-text);
}

.summary__methods {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--c-border);
}

.summary__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-muted);
}

.method {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--c-border-strong);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 14px;
}

.method:has(input:checked) {
  border-color: var(--c-accent);
  background: var(--c-accent-soft);
}

.method input {
  accent-color: var(--c-accent);
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .summary {
    position: static;
  }

  .item {
    grid-template-columns: 56px minmax(0, 1fr) auto;
    grid-template-areas:
      'media info sum'
      'stepper stepper action';
    row-gap: 12px;
  }

  .item__media {
    grid-area: media;
    width: 56px;
  }

  .item__info {
    grid-area: info;
  }

  .item__sum {
    grid-area: sum;
    min-width: 0;
  }

  .item__action {
    grid-area: action;
    justify-self: end;
  }

  .item :deep(.stepper) {
    grid-area: stepper;
    justify-self: start;
  }
}
</style>
