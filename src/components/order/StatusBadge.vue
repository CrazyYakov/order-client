<script setup lang="ts">
import { computed } from 'vue'
import { orderStatusMeta } from '@/utils/orderStatus'

const props = defineProps<{ status?: number }>()

const meta = computed(() => orderStatusMeta(props.status))
</script>

<template>
  <span class="badge" :class="`badge--${meta.tone}`">{{ meta.label }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 650;
  white-space: nowrap;
}

.badge--warning {
  background: var(--c-warning-soft);
  color: var(--c-warning);
}

.badge--success {
  background: var(--c-success-soft);
  color: var(--c-success);
}

.badge--danger {
  background: var(--c-danger-soft);
  color: var(--c-danger);
}

.badge--neutral {
  background: var(--c-surface-2);
  color: var(--c-text-muted);
}
</style>
