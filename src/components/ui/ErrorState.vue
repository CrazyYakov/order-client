<script setup lang="ts">
defineProps<{
  title?: string
  message: string
  retryable?: boolean
}>()

defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="alert" role="alert">
    <div class="alert__body">
      <p class="alert__title">{{ title ?? 'Что-то пошло не так' }}</p>
      <p class="alert__message">{{ message }}</p>
    </div>
    <button v-if="retryable" class="alert__retry" type="button" @click="$emit('retry')">
      Повторить
    </button>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  background: var(--c-danger-soft);
  border: 1px solid #f6cfcf;
  border-radius: var(--radius-md);
  color: #8f2626;
}

.alert__title {
  font-weight: 650;
  margin-bottom: 2px;
}

.alert__message {
  font-size: 14px;
}

.alert__body {
  flex: 1;
}

.alert__retry {
  border: 1px solid #e8b5b5;
  background: #fff;
  color: #8f2626;
  border-radius: var(--radius-sm);
  padding: 7px 14px;
  font-weight: 600;
  font-size: 13.5px;
}

.alert__retry:hover {
  background: #fff6f6;
}
</style>
