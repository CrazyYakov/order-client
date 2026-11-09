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
const { login } = useAuth()
const cart = useCart()
const toasts = useToasts()

const form = reactive({ email: '', password: '' })
const errors = reactive<{ email?: string; password?: string; form?: string }>({})
const loading = ref(false)

function validate(): boolean {
  errors.email = undefined
  errors.password = undefined
  errors.form = undefined

  if (!form.email.trim()) {
    errors.email = 'Укажите email'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Некорректный email'
  }

  if (!form.password) {
    errors.password = 'Укажите пароль'
  }

  return !errors.email && !errors.password
}

async function submit(): Promise<void> {
  if (!validate()) return

  loading.value = true
  try {
    await login({ email: form.email.trim(), password: form.password })
    await cart.load().catch(() => undefined)
    toasts.success('Вы вошли в аккаунт')

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    await router.replace(redirect || { name: 'catalog' })
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 401) errors.form = 'Неверный email или пароль'
      else if (e.status === 422) {
        errors.email = e.errors.email?.[0]
        errors.password = e.errors.password?.[0]
        errors.form = errors.email || errors.password ? undefined : 'Проверьте введённые данные'
      } else errors.form = e.message
    } else {
      errors.form = 'Не удалось выполнить вход'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth">
    <div class="auth__card surface">
      <h1 class="auth__title">Вход в аккаунт</h1>
      <p class="auth__subtitle">Введите email и пароль, чтобы оформлять заказы.</p>

      <form class="auth__form" novalidate @submit.prevent="submit">
        <BaseInput
          id="login-email"
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="ivan@example.com"
          autocomplete="email"
          required
          :error="errors.email"
        />
        <BaseInput
          id="login-password"
          v-model="form.password"
          type="password"
          label="Пароль"
          placeholder="••••••"
          autocomplete="current-password"
          required
          :error="errors.password"
        />

        <p v-if="errors.form" class="auth__error" role="alert">{{ errors.form }}</p>

        <BaseButton type="submit" block :loading="loading">Войти</BaseButton>
      </form>

      <p class="auth__footer">
        Нет аккаунта?
        <RouterLink :to="{ name: 'register', query: route.query }">Зарегистрироваться</RouterLink>
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
