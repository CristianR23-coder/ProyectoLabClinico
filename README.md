
# Proyecto Lab Clínico

Este proyecto es una solución integral para la gestión de un laboratorio clínico, abarcando desde la administración de pacientes, médicos, órdenes, exámenes, resultados y paneles, hasta la integración con aseguradoras y la gestión de usuarios. Está compuesto por un backend robusto en Node.js/TypeScript y un frontend moderno en Angular.

---

## Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Principales Módulos y Modelos](#principales-módulos-y-modelos)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Autores](#autores)

---

## Descripción General

El sistema permite gestionar todo el ciclo de vida de una orden de laboratorio clínico: registro de pacientes, médicos, exámenes, paneles, toma y seguimiento de muestras, validación y entrega de resultados, así como la administración de usuarios y aseguradoras. Está pensado para clínicas, laboratorios y centros de salud que requieren digitalizar y optimizar sus procesos.

## Arquitectura

- **Backend**: API RESTful desarrollada en Node.js con TypeScript, Express y Sequelize ORM. Permite conexión a múltiples motores de base de datos (MySQL, PostgreSQL, SQL Server, Oracle).
- **Frontend**: Aplicación SPA desarrollada en Angular, con componentes reutilizables y navegación protegida por autenticación.

## Tecnologías Utilizadas

### Backend
- Node.js, TypeScript, Express
- Sequelize ORM
- Soporte para MySQL, PostgreSQL, SQL Server, Oracle
- JWT para autenticación
- Dotenv, Morgan, Cors

### Frontend
- Angular 20+
- PrimeNG, PrimeIcons
- TailwindCSS
- RxJS

## Estructura de Carpetas

```
ProyectoLabClinico/
├── backend/           # API RESTful y lógica de negocio
│   ├── src/
│   │   ├── config/    # Configuración de Express y middlewares
│   │   ├── controllers/ # Controladores de recursos
│   │   ├── database/  # Modelos Sequelize y conexión DB
│   │   ├── routes/    # Definición de rutas
│   │   └── server.ts  # Entry point del backend
│   └── package.json
├── pyrLabClinico/     # Aplicación Angular (frontend)
│   ├── src/
│   │   ├── app/       # Componentes, servicios y modelos
│   │   └── ...
│   └── package.json
└── README.md
```

## Principales Módulos y Modelos

### Backend (Modelos principales)
- **User**: Usuarios del sistema (roles: paciente, médico, admin, staff)
- **Patient**: Pacientes registrados
- **Doctor**: Médicos asociados
- **Order**: Órdenes de laboratorio (ciclo: creada, tomada, en proceso, validada, entregada, anulada)
- **OrderItem**: Ítems de una orden (exámenes y paneles)
- **Exam**: Exámenes individuales
- **Panel**: Conjunto de exámenes agrupados
- **Parameter**: Parámetros medidos en cada examen
- **Result**: Resultados de exámenes y parámetros
- **Sample**: Muestras tomadas para análisis
- **Insurance**: Aseguradoras asociadas

### Frontend (Angular)
- **Componentes**: Gestión de pacientes, médicos, órdenes, resultados, exámenes, paneles, parámetros, muestras, aseguradoras, login, dashboard, landing, etc.
- **Servicios**: Comunicación con la API, gestión de sesión, autenticación, etc.
- **Modelos**: Interfaces TypeScript que reflejan la estructura de los modelos del backend.

## Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/CristianR23-coder/ProyectoLabClinico.git
cd ProyectoLabClinico
```

### 2. Backend
```bash
cd backend
npm install
# Configura tus variables de entorno en un archivo .env
npm run dev
# El backend corre por defecto en http://localhost:4000
```

### 3. Frontend
```bash
cd pyrLabClinico
npm install
npm start
# El frontend corre por defecto en http://localhost:4200
```

## Autores

- CristianR23-coder
- Colaboradores: ...

---

Para más detalles, consulta la documentación interna de cada carpeta o contacta a los autores.
