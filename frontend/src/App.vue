<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">

    <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        <div class="flex items-center gap-6">
          <span class="font-semibold text-gray-800 dark:text-gray-100">Gestión de Citas</span>
          <router-link
            to="/"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Lista
          </router-link>
          <router-link
            to="/calendar"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Calendario
          </router-link>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="toggleDark()"
            class="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {{ isDark ? 'Modo claro' : 'Modo oscuro' }}
          </button>
          <router-link
            to="/new"
            class="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Nueva cita
          </router-link>
        </div>

      </div>
    </nav>

    <main class="max-w-5xl mx-auto px-4 py-6">
      <router-view />
    </main>

  </div>
</template>

<script setup>
import { useDark, useToggle } from '@vueuse/core'
const isDark     = useDark()
const toggleDark = useToggle(isDark)
</script>