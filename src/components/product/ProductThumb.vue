<script setup lang="ts">
import { computed } from 'vue'
import { productPlaceholder } from '@/utils/placeholder'

const props = withDefaults(
  defineProps<{
    title: string
    id: number
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const placeholder = computed(() => productPlaceholder(props.id, props.title))
</script>

<template>
  <div
    class="thumb"
    :class="`thumb--${size}`"
    :style="{ background: `linear-gradient(135deg, ${placeholder.from}, ${placeholder.to})` }"
    aria-hidden="true"
  >
    <span class="thumb__initials">{{ placeholder.initials }}</span>
  </div>
</template>

<style scoped>
.thumb {
  display: grid;
  place-items: center;
  width: 100%;
  border-radius: var(--radius-md);
  color: rgba(30, 35, 55, 0.55);
  font-weight: 700;
  letter-spacing: 0.02em;
  user-select: none;
}

.thumb--sm {
  aspect-ratio: 1;
  font-size: 18px;
}

.thumb--md {
  aspect-ratio: 4 / 3;
  font-size: 40px;
}

.thumb--lg {
  aspect-ratio: 1;
  font-size: 72px;
}
</style>
