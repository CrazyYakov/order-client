<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  icon?: string
}>()
</script>

<template>
  <div class="empty">
    <div v-if="icon" class="empty__icon" aria-hidden="true">{{ icon }}</div>
    <h3 class="empty__title">{{ title }}</h3>
    <p v-if="description" class="empty__description">{{ description }}</p>
    <div v-if="$slots.default" class="empty__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 56px 24px;
  text-align: center;
  background: var(--c-surface);
  border: 1px dashed var(--c-border-strong);
  border-radius: var(--radius-lg);
}

.empty__icon {
  font-size: 34px;
  line-height: 1;
  margin-bottom: 4px;
}

.empty__title {
  font-size: 18px;
}

.empty__description {
  max-width: 420px;
  color: var(--c-text-muted);
}

.empty__actions {
  margin-top: 10px;
}
</style>
