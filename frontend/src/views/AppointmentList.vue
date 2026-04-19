<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Citas</h1>
    </div>

    <!-- Filtros -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Buscar paciente o doctor..."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          v-model="statusFilter"
          @change="store.setFilter('status', statusFilter)"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="scheduled">Programada</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>
        <input
          v-model="dateFrom"
          type="date"
          @change="store.setFilter('dateFrom', dateFrom)"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          v-model="dateTo"
          type="date"
          @change="store.setFilter('dateTo', dateTo)"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading.value" class="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
      Cargando...
    </div>

    <!-- Error -->
    <div
      v-else-if="store.error.value"
      class="border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded p-4 text-sm text-red-700 dark:text-red-300"
    >
      {{ store.error.value }}
    </div>

    <!-- Tabla -->
    <div v-else class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Paciente</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Doctor</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Horario</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-if="store.appointments.value.length === 0">
              <td colspan="6" class="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                No hay citas registradas
              </td>
            </tr>
            <tr
              v-for="appt in store.appointments.value"
              :key="appt._id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td class="px-4 py-3 text-gray-800 dark:text-gray-200">{{ appt.patientName }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ appt.doctorName }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ formatDate(appt.date) }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ appt.startTime }} - {{ appt.endTime }}</td>
              <td class="px-4 py-3"><StatusBadge :status="appt.status" /></td>
              <td class="px-4 py-3">
                <div class="flex gap-3">
                  <router-link
                    :to="`/edit/${appt._id}`"
                    class="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                  >
                    Editar
                  </router-link>
                  <button
                    @click="handleDelete(appt._id, appt.patientName)"
                    class="text-red-600 dark:text-red-400 hover:underline text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="store.pagination.value?.total > 0" class="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <Pagination :pagination="store.pagination.value" @change="store.setPage" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAppointments } from '../store/appointments'
import { useDebounceFn } from '@vueuse/core'
import StatusBadge from '../components/StatusBadge.vue'
import Pagination  from '../components/Pagination.vue'

const store        = useAppointments()
const searchInput  = ref('')
const statusFilter = ref('')
const dateFrom     = ref('')
const dateTo       = ref('')

const debouncedSearch = useDebounceFn((val) => {
  store.setFilter('search', val)
}, 400)

watch(searchInput, debouncedSearch)

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}

async function handleDelete(id, name) {
  if (!confirm(`¿Eliminar la cita de ${name}?`)) return
  await store.deleteAppointment(id)
}

onMounted(() => store.fetchAppointments())
</script>