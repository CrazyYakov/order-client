<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import ProductThumb from './ProductThumb.vue'
import { formatPrice } from '@/utils/format'

defineProps<{
  id: number
  title: string
  price: number
  busy?: boolean
}>()

defineEmits<{ add: [] }>()
</script>

<template>
  <article class="card">
    <RouterLink :to="{ name: 'product', params: { id } }" class="card__media">
      <ProductThumb :id="id" :title="title" />
    </RouterLink>

    <div class="card__body">
      <h3 class="card__title">
        <RouterLink :to="{ name: 'product', params: { id } }">{{ title }}</RouterLink>
      </h3>
      <p class="price card__price">{{ formatPrice(price) }}</p>

      <BaseButton size="sm" block :loading="busy" @click="$emit('add')">
        В корзину
      </BaseButton>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition:
    box-shadow 0.18s ease,
    transform 0.18s ease,
    border-color 0.18s ease;
}

.card:hover {
  border-color: var(--c-border-strong);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card__media {
  padding: 10px 10px 0;
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px 16px;
  flex: 1;
}

.card__title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__title a {
  color: var(--c-text);
}

.card__title a:hover {
  color: var(--c-accent);
}

.card__price {
  font-size: 18px;
  margin-top: auto;
}
</style>
