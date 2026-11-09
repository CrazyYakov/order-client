<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchProducts } from '@/api/products'
import type { Product, SortDirection } from '@/api/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import { useAuth } from '@/stores/auth'
import { useCart } from '@/stores/cart'
import { useToasts } from '@/stores/toast'
import { pluralize } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()
const cart = useCart()
const toasts = useToasts()

const serverProducts = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const addingId = ref<number | null>(null)

const searchInput = ref('')
const sortDir = ref<SortDirection | ''>('')
const maxPriceInput = ref('')

const sortOptions: { value: SortDirection | ''; label: string }[] = [
  { value: '', label: 'По умолчанию' },
  { value: 'asc', label: 'Сначала дешевле' },
  { value: 'desc', label: 'Сначала дороже' },
]

// filter_price в API сравнивает цену на равенство, поэтому верхнюю границу фильтруем на клиенте.
const maxPrice = computed(() => {
  const value = Number.parseFloat(maxPriceInput.value.replace(',', '.'))
  return Number.isFinite(value) && value > 0 ? value : null
})

const products = computed(() =>
  maxPrice.value === null
    ? serverProducts.value
    : serverProducts.value.filter((product) => product.price <= maxPrice.value!),
)

const hasFilters = computed(
  () => Boolean(searchInput.value.trim() || sortDir.value || maxPriceInput.value),
)

function readQueryString(key: string): string {
  const value = route.query[key]
  return typeof value === 'string' ? value : ''
}

function syncFromRoute(): void {
  searchInput.value = readQueryString('search')
  const dir = readQueryString('sort')
  sortDir.value = dir === 'asc' || dir === 'desc' ? dir : ''
  maxPriceInput.value = readQueryString('max')
}

let loadedKey = ''

function currentQueryKey(): string {
  return JSON.stringify([searchInput.value.trim(), sortDir.value])
}

async function load(): Promise<void> {
  const key = currentQueryKey()
  loadedKey = key

  loading.value = true
  error.value = null
  try {
    serverProducts.value = await fetchProducts({
      search: searchInput.value,
      sort_price_dir: sortDir.value,
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить товары'
  } finally {
    loading.value = false
  }
}

function applyFilters(): void {
  const query: Record<string, string> = {}
  if (searchInput.value.trim()) query.search = searchInput.value.trim()
  if (sortDir.value) query.sort = sortDir.value
  if (maxPriceInput.value.trim()) query.max = maxPriceInput.value.trim()

  const current: Record<string, string> = {}
  for (const key of ['search', 'sort', 'max'] as const) {
    const value = readQueryString(key)
    if (value) current[key] = value
  }

  if (JSON.stringify(current) === JSON.stringify(query)) return
  void router.replace({ name: 'catalog', query })
}

function resetFilters(): void {
  searchInput.value = ''
  sortDir.value = ''
  maxPriceInput.value = ''
  void router.replace({ name: 'catalog' })
}

let debounce: number | undefined

watch(searchInput, () => {
  window.clearTimeout(debounce)
  debounce = window.setTimeout(applyFilters, 400)
})

watch(sortDir, () => {
  window.clearTimeout(debounce)
  debounce = window.setTimeout(applyFilters, 400)
})

watch(maxPriceInput, () => {
  window.clearTimeout(debounce)
  debounce = window.setTimeout(applyFilters, 400)
})

watch(
  () => route.query,
  () => {
    syncFromRoute()
    if (currentQueryKey() !== loadedKey) void load()
  },
)

async function addToCart(product: Product): Promise<void> {
  if (!isAuthenticated.value) {
    toasts.info('Войдите, чтобы добавлять товары в корзину')
    void router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  addingId.value = product.id
  try {
    await cart.add(product)
    toasts.success(`«${product.title}» в корзине`)
  } catch (e) {
    toasts.error(e instanceof Error ? e.message : 'Не удалось добавить товар')
  } finally {
    addingId.value = null
  }
}

onMounted(() => {
  syncFromRoute()
  void load()
})
</script>

<template>
  <section>
    <div class="hero">
      <div>
        <h1 class="page-title">Каталог товаров</h1>
        <p class="page-subtitle">
          {{ loading ? 'Загружаем товары…' : `${products.length} ${pluralize(products.length, 'товар', 'товара', 'товаров')} в наличии` }}
        </p>
      </div>
    </div>

    <div class="filters surface">
      <BaseInput
        id="catalog-search"
        v-model="searchInput"
        type="search"
        label="Поиск"
        placeholder="Например, iPhone"
      />
      <BaseInput
        id="catalog-max-price"
        v-model="maxPriceInput"
        type="number"
        label="Цена до"
        placeholder="Без ограничений"
        inputmode="decimal"
        min="0"
        step="1"
      />
      <div class="filters__sort">
        <span class="filters__label">Сортировка</span>
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
      <BaseButton v-if="hasFilters" variant="ghost" size="sm" @click="resetFilters">
        Сбросить
      </BaseButton>
    </div>

    <ErrorState
      v-if="error"
      class="mt"
      title="Не удалось загрузить каталог"
      :message="error"
      retryable
      @retry="load"
    />

    <div v-else-if="loading" class="grid mt">
      <div v-for="n in 8" :key="n" class="skeleton-card surface">
        <BaseSkeleton height="150px" radius="12px" />
        <BaseSkeleton height="14px" width="80%" />
        <BaseSkeleton height="14px" width="45%" />
        <BaseSkeleton height="32px" radius="8px" />
      </div>
    </div>

    <EmptyState
      v-else-if="products.length === 0"
      class="mt"
      icon="🔍"
      title="Ничего не найдено"
      description="Попробуйте изменить запрос или сбросить фильтры."
    >
      <BaseButton variant="secondary" @click="resetFilters">Сбросить фильтры</BaseButton>
    </EmptyState>

    <div v-else class="grid mt">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :id="product.id"
        :title="product.title"
        :price="product.price"
        :busy="addingId === product.id"
        @add="addToCart(product)"
      />
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.filters {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) 160px minmax(260px, auto) auto;
  align-items: end;
  gap: 16px;
  padding: 16px;
}

.filters__sort {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filters__label {
  font-size: 13px;
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
  padding: 7px 12px;
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

.mt {
  margin-top: 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 18px;
}

.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}

@media (max-width: 900px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }

  .filters__sort {
    grid-column: 1 / -1;
  }
}

@media (max-width: 560px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}
</style>
