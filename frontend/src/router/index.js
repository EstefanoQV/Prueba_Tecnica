import { createRouter, createWebHistory } from 'vue-router'
import AppointmentList from '../views/AppointmentList.vue'
import AppointmentForm from '../views/AppointmentForm.vue'
import CalendarView   from '../views/CalendarView.vue'

const routes = [
  { path: '/',          component: AppointmentList },
  { path: '/new',       component: AppointmentForm },
  { path: '/edit/:id',  component: AppointmentForm },
  { path: '/calendar',  component: CalendarView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})