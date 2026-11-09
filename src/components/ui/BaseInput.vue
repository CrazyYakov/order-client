<script setup lang="ts">
const model = defineModel<string>({ default: '' })

withDefaults(
  defineProps<{
    id: string
    label?: string
    type?: 'text' | 'email' | 'password' | 'search' | 'number'
    placeholder?: string
    autocomplete?: string
    error?: string
    hint?: string
    disabled?: boolean
    required?: boolean
    inputmode?: 'text' | 'numeric' | 'decimal' | 'email'
    min?: number | string
    step?: number | string
  }>(),
  {
    type: 'text',
    required: false,
    disabled: false,
  },
)
</script>

<template>
  <div class="field">
    <label v-if="label" :for="id" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true">*</span>
    </label>
    <input
      :id="id"
      v-model="model"
      class="field__input"
      :class="{ 'field__input--invalid': error }"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="disabled"
      :required="required"
      :inputmode="inputmode"
      :min="min"
      :step="step"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
    />
    <p v-if="error" :id="`${id}-error`" class="field__error">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-muted);
}

.field__required {
  color: var(--c-danger);
}

.field__input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--c-border-strong);
  border-radius: var(--radius-sm);
  background: var(--c-surface);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.field__input::placeholder {
  color: #9aa1b2;
}

.field__input:focus {
  outline: none;
  border-color: var(--c-accent);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.14);
}

.field__input--invalid {
  border-color: var(--c-danger);
}

.field__input--invalid:focus {
  box-shadow: 0 0 0 3px rgba(209, 59, 59, 0.14);
}

.field__error {
  font-size: 12.5px;
  color: var(--c-danger);
}

.field__hint {
  font-size: 12.5px;
  color: var(--c-text-muted);
}
</style>
