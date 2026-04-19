<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <h1 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Calendario</h1>

      <div class="flex items-center gap-2">
        <div class="flex border border-gray-300 dark:border-gray-600 rounded overflow-hidden text-sm">
          <button
            @click="viewMode = 'week'"
            :class="viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'"
            class="px-3 py-1.5"
          >
            Semana
          </button>
          <button
            @click="viewMode = 'month'"
            :class="viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'"
            class="px-3 py-1.5 border-l border-gray-300 dark:border-gray-600"
          >
            Mes
          </button>
        </div>
        <button @click="navigate(-1)" class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">&lt;</button>
        <button @click="goToToday"   class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">Hoy</button>
        <button @click="navigate(1)"  class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">&gt;</button>
      </div>
    </div>

    <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 capitalize">{{ periodTitle }}</p>

    <!-- Vista semanal -->
    <div v-if="viewMode === 'week'" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
      <div class="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
        <div class="p-2"></div>
        <div
          v-for="day in weekDays"
          :key="day.iso"
          class="p-2 text-center border-l border-gray-100 dark:border-gray-700"
          :class="day.isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''"
        >
          <p class="text-xs text-gray-400 dark:text-gray-500 uppercase">{{ day.weekday }}</p>
          <p class="text-sm font-medium" :class="day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'">
            {{ day.dayNum }}
          </p>
        </div>
      </div>
      <div class="overflow-y-auto max-h-[500px]">
        <div
          v-for="hour in hours"
          :key="hour"
          class="grid grid-cols-8 border-b border-gray-100 dark:border-gray-700 min-h-[52px]"
        >
          <div class="p-1 text-xs text-gray-400 dark:text-gray-500 text-right pr-2 pt-1">
            {{ String(hour).padStart(2, '0') }}:00
          </div>
          <div
            v-for="day in weekDays"
            :key="day.iso"
            class="border-l border-gray-100 dark:border-gray-700 p-1"
            :class="day.isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''"
          >
            <div
              v-for="appt in getAppointmentsForCell(day.iso, hour)"
              :key="appt._id"
              @click="router.push(`/edit/${appt._id}`)"
              class="text-xs rounded px-1 py-0.5 mb-0.5 cursor-pointer truncate"
              :class="statusColors[appt.status]"
            >
              {{ appt.patientName }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista mensual -->
    <div v-else class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
      <div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        <div
          v-for="d in ['Lun','Mar','Mie','Jue','Vie','Sab','Dom']"
          :key="d"
          class="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
        >
          {{ d }}
        </div>
      </div>
      <div class="grid grid-cols-7">
        <div
          v-for="cell in monthCells"
          :key="cell.iso || cell.empty"
          class="min-h-[90px] p-1.5 border-b border-r border-gray-100 dark:border-gray-700"
          :class="cell.isToday ? 'bg-blue-50 dark:bg-blue-900/20' : cell.otherMonth ? 'opacity-40' : ''"
        >
          <p
            v-if="cell.day"
            class="text-xs font-medium mb-1"
            :class="cell.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'"
          >
            {{ cell.day }}
          </p>
          <div
            v-for="appt in getAppointmentsForDay(cell.iso)"
            :key="appt._id"
            @click="router.push(`/edit/${appt._id}`)"
            class="text-xs rounded px-1 py-0.5 mb-0.5 cursor-pointer truncate"
            :class="statusColors[appt.status]"
          >
            {{ appt.startTime }} {{ appt.patientName }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { appointmentService } from '../services/appointmentService'

const router   = useRouter()
const viewMode = ref('week')
const current  = ref(new Date())
const allAppts = ref([])

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const hours = Array.from({ length: 13 }, (_, i) => i + 7)

const weekDays = computed(() => {
  const days = []
  const date = new Date(current.value)
  const day  = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  const today = new Date().toISOString().split('T')[0]
  for (let i = 0; i < 7; i++) {
    const d = new Date(date)
    d.setDate(date.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    days.push({
      iso,
      weekday: d.toLocaleDateString('es-ES', { weekday: 'short' }),
      dayNum:  d.getDate(),
      isToday: iso === today,
    })
  }
  return days
})

const monthCells = computed(() => {
  const year  = current.value.getFullYear()
  const month = current.value.getMonth()
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)
  const today = new Date().toISOString().split('T')[0]
  const cells = []
  const startDay = (first.getDay() || 7) - 1
  for (let i = 0; i < startDay; i++) cells.push({ empty: i, otherMonth: true })
  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(year, month, d)
    const iso  = date.toISOString().split('T')[0]
    cells.push({ day: d, iso, isToday: iso === today })
  }
  return cells
})

const periodTitle = computed(() => {
  if (viewMode.value === 'week') {
    const first = weekDays.value[0]
    const last  = weekDays.value[6]
    return `${first.dayNum} - ${last.dayNum} ${current.value.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
  }
  return current.value.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
})

function navigate(dir) {
  const d = new Date(current.value)
  if (viewMode.value === 'week') d.setDate(d.getDate() + dir * 7)
  else d.setMonth(d.getMonth() + dir)
  current.value = d
}

function goToToday() { current.value = new Date() }

function getAppointmentsForCell(iso, hour) {
  return allAppts.value.filter(a => {
    const apptDate = a.date.split('T')[0]
    const apptHour = parseInt(a.startTime.split(':')[0])
    return apptDate === iso && apptHour === hour
  })
}

function getAppointmentsForDay(iso) {
  if (!iso) return []
  return allAppts.value.filter(a => a.date.split('T')[0] === iso)
}

async function loadAppointments() {
  const { data } = await appointmentService.getAll({ limit: 200 })
  allAppts.value = data.data
}

onMounted(loadAppointments)
watch(viewMode, loadAppointments)
</script>