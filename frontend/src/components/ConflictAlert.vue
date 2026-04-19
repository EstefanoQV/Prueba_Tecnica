<template>
  <div class="border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded p-4">
    <p class="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
      Conflicto de horario detectado
    </p>
    <p class="text-xs text-red-600 dark:text-red-400 mb-3">
      Las siguientes citas se solapan con el horario seleccionado:
    </p>
    <ul class="space-y-2 mb-3">
      <li
        v-for="c in conflicts"
        :key="c.id"
        class="text-xs bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded p-2"
      >
        <span class="font-medium text-gray-800 dark:text-gray-200">{{ c.patientName }}</span>
        <span class="text-gray-500 dark:text-gray-400 ml-2">{{ c.startTime }} - {{ c.endTime }}</span>
        <span v-if="c.reason" class="text-gray-400 dark:text-gray-500 ml-2">— {{ c.reason }}</span>
      </li>
    </ul>
    <button
      @click="$emit('dismiss')"
      class="text-xs text-red-600 dark:text-red-400 hover:underline"
    >
      Cerrar
    </button>
  </div>
</template>

<script setup>
defineProps({ conflicts: { type: Array, required: true } })
defineEmits(['dismiss'])
</script>