<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/api/client'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useAuth } from '@/stores/auth'
import { useCart } from '@/stores/cart'
import { useToasts } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const { register } = useAuth()
const cart = useCart()
const toasts = useToasts()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const errors = reactive<Record<string, string | undefined>>({})
const loading = ref(false)

function validate(): boolean {
  for (const key of Object.keys(errors)) delete errors[key]

  if (!form.name.trim()) errors.name = 'Укажите имя'
  else if (form.name.trim().length > 255) errors.name = 'Не больше 255 символов'

  if (!form.email.trim()) errors.email = 'Укажите email'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Некорректный email'

  if (!form.password) errors.password = 'Придумайте пароль'
  else if (form.password.length < 6) errors.password = 'Минимум 6 символов'

  if (!form.password_confirmation) errors.password_confirmation = 'Повторите пароль'
  else if (form.password_confirmation !== form.password) {
    errors.password_confirmation = 'Пароли не совпадают'
  }

  return Object.keys(errors).length === 0
}

async function submit(): Promise<void> {
  if (!validate()) return

  loading.value = true
  try {
    await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      password_confirmation: form.password_confirmation,
    })
    await cart.load().catch(() => undefined)
    toasts.success('Аккаунт создан')

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    await router.replace(redirect || { name: 'catalog' })
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 400) {
        errors.email = e.message
      } else if (e.status === 422) {
        for (const [field, messages] of Object.entries(e.errors)) {
          errors[field] = messages[0]
        }
        if (Object.keys(e.errors).length === 0) errors.form = e.message
      } else {
        errors.form = e.message
      }
    } else {
      errors.form = 'Не удалось зарегистрироваться'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth">
    <div class="auth__card surface">
      <h1 class="auth__title">Регистрация</h1>
      <p class="auth__subtitle">Создайте аккаунт — это займёт меньше минуты.</p>

      <form class="auth__form" novalidate @submit.prevent="submit">
        <BaseInput
          id="register-name"
          v-model="form.name"
          label="Имя"
          placeholder="Иван Петров"
          autocomplete="name"
          required
          :error="errors.name"
        />
        <BaseInput
          id="register-email"
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="ivan@example.com"
          autocomplete="email"
          required
          :error="errors.email"
        />
        <BaseInput
          id="register-password"
          v-model="form.password"
          type="password"
          label="Пароль"
          placeholder="Минимум 6 символов"
          autocomplete="new-password"
          required
          :error="errors.password"
        />
        <BaseInput
          id="register-password-confirmation"
          v-model="form.password_confirmation"
          type="password"
          label="Повтор пароля"
          autocomplete="new-password"
          required
          :error="errors.password_confirmation"
        />

        <p v-if="errors.form" class="auth__error" role="alert">{{ errors.form }}</p>

        <BaseButton type="submit" block :loading="loading">Создать аккаунт</BaseButton>
      </form>

      <p class="auth__footer">
        Уже есть аккаунт?
        <RouterLink :to="{ name: 'login', query: route.query }">Войти</RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.auth {
  display: flex;
  justify-content: center;
  padding-top: 24px;
}

.auth__card {
  width: 100%;
  max-width: 420px;
  padding: 28px;
}

.auth__title {
  font-size: 24px;
  margin-bottom: 6px;
}

.auth__subtitle {
  color: var(--c-text-muted);
  margin-bottom: 20px;
  font-size: 14px;
}

.auth__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth__error {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--c-danger-soft);
  color: #8f2626;
  font-size: 13.5px;
}

.auth__footer {
  margin-top: 18px;
  font-size: 14px;
  color: var(--c-text-muted);
  text-align: center;
}
</style>
