<template>
  <div class="flex items-center justify-between mt-4 text-sm">
    <span class="text-gray-500 dark:text-gray-400">
      {{ from }}-{{ to }} de {{ pagination.total }} citas
    </span>
    <div class="flex items-center gap-2">
      <button
        :disabled="!pagination.hasPrevPage"
        @click="$emit('change', pagination.page - 1)"
        class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        Anterior
      </button>
      <span class="text-gray-500 dark:text-gray-400">
        {{ pagination.page }} / {{ pagination.totalPages }}
      </span>
      <button
        :disabled="!pagination.hasNextPage"
        @click="$emit('change', pagination.page + 1)"
        class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ pagination: { type: Object, required: true } })
defineEmits(['change'])
const from = computed(() => ((props.pagination.page - 1) * props.pagination.limit) + 1)
const to   = computed(() => Math.min(props.pagination.page * props.pagination.limit, props.pagination.total))
</script>