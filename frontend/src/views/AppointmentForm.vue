<template>
  <div class="max-w-xl mx-auto">
    <div class="flex items-center gap-3 mb-4">
      <button
        @click="router.back()"
        class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
      >
        Volver
      </button>
      <h1 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {{ isEditing ? 'Editar cita' : 'Nueva cita' }}
      </h1>
    </div>

    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-6">

      <ConflictAlert
        v-if="conflicts.length > 0"
        :conflicts="conflicts"
        @dismiss="conflicts = []"
        class="mb-5"
      />

      <div
        v-if="successMsg"
        class="mb-5 border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded p-3 text-sm text-green-700 dark:text-green-300"
      >
        {{ successMsg }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Paciente *
            </label>
            <input
              v-model="form.patientName"
              type="text"
              placeholder="Juan Pérez"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p v-if="formErrors.patientName" class="text-xs text-red-500 mt-1">{{ formErrors.patientName }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Doctor *
            </label>
            <input
              v-model="form.doctorName"
              type="text"
              placeholder="Dr. García"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p v-if="formErrors.doctorName" class="text-xs text-red-500 mt-1">{{ formErrors.doctorName }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Fecha *
            </label>
            <input
              v-model="form.date"
              type="date"
              :min="today"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p v-if="formErrors.date" class="text-xs text-red-500 mt-1">{{ formErrors.date }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Estado
            </label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="scheduled">Programada</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Hora inicio *
            </label>
            <input
              v-model="form.startTime"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p v-if="formErrors.startTime" class="text-xs text-red-500 mt-1">{{ formErrors.startTime }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Hora fin *
            </label>
            <input
              v-model="form.endTime"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p v-if="formErrors.endTime" class="text-xs text-red-500 mt-1">{{ formErrors.endTime }}</p>
          </div>

        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Motivo
          </label>
          <textarea
            v-model="form.reason"
            rows="3"
            placeholder="Describe el motivo de la consulta..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>

        <div class="flex gap-3 pt-1">
          <button
            type="submit"
            :disabled="submitting"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded"
          >
            {{ submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear cita') }}
          </button>
          <button
            type="button"
            @click="router.back()"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appointmentService } from '../services/appointmentService'
import ConflictAlert from '../components/ConflictAlert.vue'

const route  = useRoute()
const router = useRouter()

const isEditing  = computed(() => !!route.params.id)
const submitting = ref(false)
const conflicts  = ref([])
const successMsg = ref('')
const formErrors = reactive({})

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  patientName: '',
  doctorName:  '',
  date:        '',
  startTime:   '',
  endTime:     '',
  reason:      '',
  status:      'scheduled',
})

onMounted(async () => {
  if (isEditing.value) {
    const { data } = await appointmentService.getById(route.params.id)
    const appt = data.data
    form.patientName = appt.patientName
    form.doctorName  = appt.doctorName
    form.date        = appt.date.split('T')[0]
    form.startTime   = appt.startTime
    form.endTime     = appt.endTime
    form.reason      = appt.reason || ''
    form.status      = appt.status
  }
})

function validate() {
  Object.keys(formErrors).forEach(k => delete formErrors[k])
  let valid = true

  if (!form.patientName.trim()) { formErrors.patientName = 'Obligatorio'; valid = false }
  if (!form.doctorName.trim())  { formErrors.doctorName  = 'Obligatorio'; valid = false }
  if (!form.date)               { formErrors.date        = 'Obligatorio'; valid = false }
  if (!form.startTime)          { formErrors.startTime   = 'Obligatorio'; valid = false }
  if (!form.endTime)            { formErrors.endTime     = 'Obligatorio'; valid = false }

  if (form.startTime && form.endTime && form.startTime >= form.endTime) {
    formErrors.endTime = 'Debe ser posterior a la hora de inicio'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  submitting.value = true
  conflicts.value  = []
  successMsg.value = ''

  try {
    if (isEditing.value) {
      await appointmentService.update(route.params.id, form)
    } else {
      await appointmentService.create(form)
    }
    successMsg.value = isEditing.value ? 'Cita actualizada' : 'Cita creada correctamente'
    setTimeout(() => router.push('/'), 1200)
  } catch (err) {
    if (err.response?.status === 409) {
      conflicts.value = err.response.data.conflicts
    } else {
      alert(err.response?.data?.message || 'Error al guardar')
    }
  } finally {
    submitting.value = false
  }
}
</script>