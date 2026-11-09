<script setup lang="ts">
withDefaults(
  defineProps<{
    height?: string
    width?: string
    radius?: string
  }>(),
  {
    height: '16px',
    width: '100%',
    radius: '8px',
  },
)
</script>

<template>
  <div
    class="skeleton"
    :style="{ height, width, borderRadius: radius }"
    aria-hidden="true"
  />
</template>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, #eef0f6 25%, #f6f7fb 37%, #eef0f6 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
