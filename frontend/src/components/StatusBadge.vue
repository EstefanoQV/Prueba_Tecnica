<template>
  <span :class="badgeClass" class="px-2 py-0.5 rounded text-xs font-medium">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const config = {
  scheduled: { label: 'Programada', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  completed: { label: 'Completada', class: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  cancelled: { label: 'Cancelada',  class: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
}

const badgeClass = computed(() => config[props.status]?.class || 'bg-gray-100 text-gray-700')
const label      = computed(() => config[props.status]?.label || props.status)
</script>