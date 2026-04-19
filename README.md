# Sistema de Gestión de Citas

## Descripción

Aplicación fullstack para la gestión de citas médicas/profesionales con detección automática de solapamientos.
Permite crear, visualizar, editar y eliminar citas, asegurando que no existan conflictos de horario para un mismo profesional.

El sistema valida en tiempo real que las citas no se superpongan, manteniendo la integridad de la agenda.

---

## Stack Tecnológico

**Frontend**

* Vue 3
* Tailwind CSS
* Vite

**Backend**

* Node.js
* Express.js

**Base de Datos**

* MongoDB (Mongoose)

---

## Funcionalidades

* CRUD completo de citas
* Detección de solapamientos por doctor y horario
* Filtros por:

  * Fecha
  * Doctor
  * Estado
* Validaciones:

  * Hora de fin mayor a hora de inicio
  * Fecha no anterior al día actual
* Feedback visual en el frontend
* Manejo de errores con respuestas HTTP apropiadas

---

## Lógica de Solapamiento

Una cita se considera en conflicto si cumple la siguiente condición:

```
(newStart < existingEnd) && (newEnd > existingStart)
```

Casos cubiertos:

* Solapamiento total
* Solapamiento parcial (inicio o fin)
* Citas envolventes

Casos NO considerados conflicto:

* Citas consecutivas exactas (ej: 10:00–11:00 y 11:00–12:00)
* Citas con diferentes doctores

---

## Estructura del Proyecto

```
proyecto/
├── backend/
|   ├── node_modules/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── tests/
│   │   └── utils/
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── .vscode/
|   ├── node_modules/
|   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── router/
│   │   ├── store/
│   │   ├── tests/
│   │   ├── views/
│   │   ├── services/
│   │   └── utils/
│   │   ├── App.vue
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Instalación y Ejecución

### Backend

```
cd backend
npm install
npm run dev
```

### Frontend

```
cd frontend
npm install
npm run dev
```

---

## API Endpoints

### POST /api/appointments

Crea una nueva cita con validación de solapamiento.

### GET /api/appointments

Lista citas con filtros opcionales:

* date
* doctorName
* status

### GET /api/appointments/:id

Obtiene el detalle de una cita.

### PUT /api/appointments/:id

Actualiza una cita existente con validaciones.

### DELETE /api/appointments/:id

Elimina una cita.

### GET /api/appointments/conflicts/check

Verifica conflictos de horario.

---

## Decisiones Técnicas

* Separación por capas (routes, controllers, models) para mantener el código organizado.
* Uso de funciones reutilizables para la lógica de validación de solapamientos.
* Manejo de fechas y horas desacoplado (date + strings "HH:mm") para simplificar validaciones.
* Validaciones tanto en backend como en frontend para mejorar la experiencia del usuario.
* Uso de estados HTTP semánticos (ej: 409 para conflictos).

---

## Supuestos y Limitaciones

* Validaciones de formato básicas (no se implementa validación compleja de inputs).
* No incluye autenticación ni autorización.

---

## BONUS FALTANTE

* Confirmación de citas por email

---

## Notas

Se usó asistencia de herramientas de IA para acelerar la generación de boilerplate y resolver consultas sobre el desarrollo.
