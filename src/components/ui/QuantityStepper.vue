<script setup lang="ts">
withDefaults(
  defineProps<{
    value: number
    min?: number
    max?: number
    disabled?: boolean
  }>(),
  { min: 1, max: 99, disabled: false },
)

const emit = defineEmits<{ decrease: []; increase: [] }>()
</script>

<template>
  <div class="stepper">
    <button
      class="stepper__btn"
      type="button"
      aria-label="Уменьшить количество"
      :disabled="disabled || value <= min"
      @click="emit('decrease')"
    >
      −
    </button>
    <span class="stepper__value">{{ value }}</span>
    <button
      class="stepper__btn"
      type="button"
      aria-label="Увеличить количество"
      :disabled="disabled || value >= max"
      @click="emit('increase')"
    >
      +
    </button>
  </div>
</template>

<style scoped>
.stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--c-border-strong);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--c-surface);
}

.stepper__btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 17px;
  line-height: 1;
  color: var(--c-text);
}

.stepper__btn:hover:not(:disabled) {
  background: var(--c-surface-2);
}

.stepper__btn:disabled {
  color: #b9bfcd;
  cursor: not-allowed;
}

.stepper__value {
  min-width: 36px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
