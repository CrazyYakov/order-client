<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { fetchProduct } from '@/api/products'
import type { Product } from '@/api/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import ProductThumb from '@/components/product/ProductThumb.vue'
import { useAuth } from '@/stores/auth'
import { useCart } from '@/stores/cart'
import { useToasts } from '@/stores/toast'
import { formatPrice } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()
const cart = useCart()
const toasts = useToasts()

const product = ref<Product | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const adding = ref(false)

const productId = computed(() => Number(route.params.id))

const inCart = computed(() => {
  if (!product.value) return 0
  return cart.state.items.find((item) => item.id === product.value?.id)?.count ?? 0
})

async function load(): Promise<void> {
  const id = productId.value
  if (!Number.isInteger(id) || id <= 0) {
    error.value = 'Некорректный идентификатор товара'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null
  try {
    product.value = await fetchProduct(id)
  } catch (e) {
    product.value = null
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить товар'
  } finally {
    loading.value = false
  }
}

async function addToCart(): Promise<void> {
  if (!product.value) return

  if (!isAuthenticated.value) {
    toasts.info('Войдите, чтобы добавлять товары в корзину')
    void router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  adding.value = true
  try {
    await cart.add(product.value)
    toasts.success('Товар добавлен в корзину')
  } catch (e) {
    toasts.error(e instanceof Error ? e.message : 'Не удалось добавить товар')
  } finally {
    adding.value = false
  }
}

onMounted(load)
watch(productId, load)
</script>

<template>
  <section>
    <RouterLink :to="{ name: 'catalog' }" class="back">← В каталог</RouterLink>

    <div v-if="loading" class="layout">
      <BaseSkeleton height="380px" radius="18px" />
      <div class="stack">
        <BaseSkeleton height="30px" width="70%" />
        <BaseSkeleton height="24px" width="35%" />
        <BaseSkeleton height="90px" radius="12px" />
        <BaseSkeleton height="42px" radius="8px" />
      </div>
    </div>

    <ErrorState
      v-else-if="error"
      class="mt"
      title="Товар недоступен"
      :message="error"
      retryable
      @retry="load"
    />

    <div v-else-if="product" class="layout">
      <div class="media surface">
        <ProductThumb :id="product.id" :title="product.title" size="lg" />
      </div>

      <div class="info">
        <p class="info__sku">Артикул: {{ product.id }}</p>
        <h1 class="info__title">{{ product.title }}</h1>
        <p class="info__price price">{{ formatPrice(product.price) }}</p>

        <p class="info__description">
          Демонстрационный товар из тестового каталога. Описание и характеристики не предоставляются
          API, поэтому карточка показывает только доступные данные.
        </p>

        <div v-if="inCart > 0" class="info__badge">
          Уже в корзине: {{ inCart }}
        </div>

        <div class="info__actions">
          <BaseButton :loading="adding" @click="addToCart">Добавить в корзину</BaseButton>
          <BaseButton variant="secondary" @click="router.push({ name: 'cart' })">
            Перейти в корзину
          </BaseButton>
        </div>
      </div>
    </div>
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

.layout {
  display: grid;
  grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}

.media {
  padding: 16px;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
}

.info__sku {
  font-size: 13px;
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}

.info__title {
  font-size: 30px;
}

.info__price {
  font-size: 26px;
  color: var(--c-accent);
}

.info__description {
  color: var(--c-text-muted);
}

.info__badge {
  align-self: flex-start;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--c-success-soft);
  color: var(--c-success);
  font-size: 13px;
  font-weight: 600;
}

.info__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
}

.mt {
  margin-top: 20px;
}

@media (max-width: 820px) {
  .layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .info__title {
    font-size: 24px;
  }
}
</style>
