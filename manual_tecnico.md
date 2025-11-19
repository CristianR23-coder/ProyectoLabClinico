# 📘 SYSTEM DOCUMENTATION

## 1. Project Information

Project Name: LabPro - LIMS 

Student Name: Cristian Daniel Ramirez Vega 

Course: Desarrollo de Software 

GitHub: https://github.com/CristianR23-coder/ProyectoLabClinico.git

Semester: 8 

Date: 18 de noviembre 

Instructor: Jaider Quintero 

Short Project Description: The LabPro system is a comprehensive platform designed to efficiently manage the operational, administrative, and clinical processes of a diagnostic laboratory. Its purpose is to optimize the handling of medical orders, biological samples, results, diagnostic validation, and official report delivery, ensuring traceability, security, and accuracy at every stage of the laboratory workflow. 

## 2. System Architecture Overview

### 2.1 Architecture Description
LabPro follows a layered web architecture. An Angular single-page application handles all presentation logic, stateful UI widgets, routing, and guards. The frontend communicates with a stateless Node.js/Express API that exposes REST resources grouped by controllers (patients, orders, exams, security, etc.). Business logic lives in those controllers and in middleware that centralizes authentication, authorization, and auditing. Data persistence is handled through Sequelize ORM, which abstracts a multi-engine relational database (MySQL by default, also PostgreSQL, SQL Server, and Oracle). JWT-based security, refresh tokens, and RBAC resources complete the architecture.

### 2.2 Technologies Used

-   Frontend: Angular 20.1 with standalone components, PrimeNG/PrimeIcons UI kit, Tailwind CSS utility classes, Chart.js visualizations, RxJS for state streams, Angular Router + guards/interceptors.
-   Backend: Node.js 20 + TypeScript 5, Express 5, Sequelize ORM, class-based controllers, custom middleware, Nodemon and ts-node for development.
-   Database Engine: MySQL 8 by default, with pluggable connections for PostgreSQL 15, SQL Server 2019+, and Oracle 19c through Sequelize dialects.
-   Additional Libraries / Tools: JSON Web Tokens, bcryptjs, dotenv, morgan, cors, VS Code REST Client collections, faker seeders, GitHub workflows.

### 2.3 Visual explanation of the system’s operation

```txt
┌────────────┐
│ End User   │
│ (browser)  │
└─────┬──────┘
      │ HTTPS + JWT, refresh token stored in SessionService
      ▼
┌──────────────────────────────┐
│ Angular SPA (PrimeNG UI)     │
│ • standalone components      │
│ • router guards/interceptors │
│ • RxJS view-model streams    │
└─────┬────────────┬───────────┘
      │ REST calls │ state updates
      ▼            │
┌──────────────────────────────┐
│ Node.js / Express API        │
│ • routes + controllers       │
│ • auth/RBAC middleware       │
│ • DTO validation (class-validator) │
└─────┬────────────────────────┘
      │ ORM queries / transactions
      ▼
┌──────────────────────────────┐
│ Sequelize ORM Layer          │
│ • Models & associations      │
│ • Hooks (user ↔ patient sync)│
│ • Dialect abstraction        │
└─────┬────────────────────────┘
      │ SQL (MySQL/PostgreSQL/SQL Server/Oracle)
      ▼
┌──────────────────────────────┐
│ Relational Database          │
│ • patients, orders, results  │
│ • auth tables, logs          │
└─────┬────────────────────────┘
      │ persisted rows
      ▼
┌──────────────────────────────┐
│ Response to Express          │
│ • business rules applied     │
└─────┬────────────────────────┘
      │ JSON payload
      ▼
┌──────────────────────────────┐
│ Angular Services             │
│ • BehaviorSubject next()     │
│ • error handling / toasts    │
└─────┬────────────────────────┘
      │ async pipe / template binding
      ▼
┌──────────────────────────────┐
│ Angular Components | PrimeNG │
│ • UI refresh + feedback      │
└──────────────────────────────┘
```

## 3. Database Documentation (ENGLISH)

### 3.1 Database Description
The schema captures the full lifecycle of a lab order. Core aggregates are Patients, Doctors, Exams, Panels, Orders, Samples, and Results. Authentication tables (users, roles, resources) support fine-grained authorization, while administrative tables (insurances, patient_insurances) keep contract metadata. Soft-delete columns (`status`, `is_active`) preserve history. Sequelize enforces referential integrity and synchronizes the schema to any supported engine.

### 3.2 ERD – Entity Relationship Diagram
Conceptually, Users relate to Roles (M:N through role_users) and permissions (resources/resource_roles). Patients, Doctors, and Insurances link to Orders, Samples, and Results. Each Order aggregates OrderItems (exams requested), Samples (collected specimens), and Results (parameter-level measurements). Panels group Exams/Parameters via PanelItems. RefreshTokens extend the auth model. PatientInsurance provides the bridge between patients and coverage providers.

### 3.3 Logical Model
- Users authenticate with credentials, receive JWT + refresh tokens, and map to business personas (patients/doctors/admins) through the `userId` or `user_id` foreign keys.
- Patients and Doctors are enriched entities with demographic and professional data; they own multiple orders.
- Exams define catalog metadata (code, specimen, price). Parameters belong to Exams, PanelItems reuse Exams/Parameters to build panels.
- Orders capture the commercial transaction (priority, totals), while OrderItems reference the concrete exams requested. Samples tie to orderId, and Results tie simultaneously to order, sample, exam, and parameter, enabling traceability.
- Insurances, patient_insurances, and patientInsuranceRoutes let the UI associate coverage per patient, affecting billing and reporting workflows.

### 3.4 Physical Model (Tables)

| Table | Column | Type | PK/FK | Description |
|-------|--------|------|-------|-------------|
| users | id | INT | PK | Auto-increment identifier. |
| users | username | VARCHAR(255) |  | Unique login. |
| users | role | ENUM(PATIENT,DOCTOR,ADMIN,STAFF) |  | High-level persona used by hooks. |
| users | status | ENUM(ACTIVE,INACTIVE) |  | Soft-delete flag. |
| users | password | VARCHAR |  | BCrypt hash stored for login. |
| roles | id | INT | PK | Role catalog. |
| roles | name | VARCHAR |  | Unique role name referenced by hooks. |
| roles | is_active | ENUM(ACTIVE,INACTIVE) |  | Logical status. |
| role_users | id | INT | PK | Assignment identifier. |
| role_users | role_id | INT | FK→roles.id | Role reference. |
| role_users | user_id | INT | FK→users.id | User reference. |
| role_users | is_active | ENUM |  | Enables/disables assignment. |
| resources | id | INT | PK | API resource id. |
| resources | path | VARCHAR |  | Route pattern protected. |
| resources | method | VARCHAR |  | HTTP verb bound to the path. |
| resources | description | VARCHAR |  | Human-friendly explanation. |
| resources | is_active | ENUM |  | Flag for lifecycle. |
| resource_roles | id | INT | PK | Permission record. |
| resource_roles | resource_id | INT | FK→resources.id | Resource pointer. |
| resource_roles | role_id | INT | FK→roles.id | Role pointer. |
| resource_roles | is_active | ENUM |  | Enables/disables mapping. |
| refresh_tokens | id | INT | PK | Token identifier. |
| refresh_tokens | token | VARCHAR |  | JWT refresh token. |
| refresh_tokens | device_info | VARCHAR |  | Optional device metadata. |
| refresh_tokens | is_valid | ENUM |  | ACTIVE/INACTIVE refresh token. |
| refresh_tokens | expires_at | DATETIME |  | Expiration instant. |
| refresh_tokens | user_id | INT | FK→users.id | Owner account. |
| patients | id | INT | PK | Auto-increment patient id. |
| patients | docType | VARCHAR |  | Document type. |
| patients | docNumber | VARCHAR | UNIQUE | National id. |
| patients | firstName | VARCHAR |  | Names. |
| patients | lastName | VARCHAR |  | Last names. |
| patients | birthDate | DATE |  | Optional DOB. |
| patients | gender | VARCHAR |  | Gender marker. |
| patients | phone | VARCHAR |  | Contact phone. |
| patients | email | VARCHAR |  | Email with validation. |
| patients | address | VARCHAR |  | Address. |
| patients | userId | INT | FK→users.id | Portal account linking. |
| patients | status | ENUM |  | ACTIVE/INACTIVE flag. |
| doctors | id | INT | PK | Auto-increment doctor id. |
| doctors | docType | VARCHAR |  | Document type. |
| doctors | docNumber | VARCHAR | UNIQUE | License id. |
| doctors | name | VARCHAR |  | Full name. |
| doctors | specialty | VARCHAR |  | Medical specialty. |
| doctors | medicalLicense | VARCHAR |  | Collegiate/registry number. |
| doctors | phone | VARCHAR |  | Contact phone. |
| doctors | email | VARCHAR |  | Email with validation. |
| doctors | user_id | INT | FK→users.id | Account linking. |
| doctors | status | ENUM |  | ACTIVE/INACTIVE flag. |
| insurances | id | INT | PK | Insurance id. |
| insurances | name | VARCHAR | UNIQUE | Insurance name. |
| insurances | nit | VARCHAR |  | Government id. |
| insurances | phone | VARCHAR |  | Contact phone. |
| insurances | email | VARCHAR |  | Contact email. |
| insurances | address | VARCHAR |  | Address. |
| insurances | status | ENUM |  | ACTIVE/INACTIVE. |
| patient_insurances | patientId | INT | PK/FK→patients.id | Patient reference. |
| patient_insurances | insuranceId | INT | PK/FK→insurances.id | Insurance reference. |
| patient_insurances | policyNumber | VARCHAR |  | Policy id. |
| patient_insurances | plan | VARCHAR |  | Plan type. |
| patient_insurances | startDate | DATE |  | Coverage start. |
| patient_insurances | endDate | DATE |  | Coverage end. |
| patient_insurances | status | ENUM |  | ACTIVE/INACTIVE relation. |
| exams | id | INT | PK | Exam id. |
| exams | code | VARCHAR | UNIQUE | Catalog code. |
| exams | name | VARCHAR |  | Exam name. |
| exams | method | VARCHAR |  | Method used. |
| exams | specimenType | ENUM |  | Specimen category. |
| exams | processingTimeMin | INT |  | Estimated minutes. |
| exams | status | ENUM |  | ACTIVE/INACTIVE. |
| exams | priceBase | DECIMAL(12,2) |  | Base rate. |
| parameters | id | INT | PK | Parameter id. |
| parameters | examenId | INT | FK→exams.id | Parent exam. |
| parameters | code | VARCHAR |  | Optional code. |
| parameters | name | VARCHAR |  | Parameter name. |
| parameters | unit | VARCHAR |  | Measurement unit. |
| parameters | refMin | DECIMAL |  | Lower reference value. |
| parameters | refMax | DECIMAL |  | Upper reference value. |
| parameters | typeValue | ENUM(NUMERICO,TEXTO,CUALITATIVO,BOOLEAN) |  | Value type. |
| parameters | decimals | INT |  | Decimal precision. |
| parameters | visualOrder | INT |  | Display order. |
| parameters | status | ENUM |  | ACTIVE/INACTIVE. |
| panels | id | INT | PK | Panel id. |
| panels | name | VARCHAR | UNIQUE | Panel name. |
| panels | description | VARCHAR |  | Description. |
| panels | status | ENUM |  | ACTIVE/INACTIVE. |
| panel_items | id | INT | PK | Panel item id. |
| panel_items | panelId | INT | FK→panels.id | Panel reference. |
| panel_items | kind | ENUM(EXAM,PARAM) |  | Defines item type. |
| panel_items | examId | INT | FK→exams.id | Linked exam. |
| panel_items | parameterId | INT | FK→parameters.id | Linked parameter. |
| panel_items | required | BOOLEAN |  | Mandatory flag. |
| panel_items | order | INT |  | Display order. |
| panel_items | notes | TEXT |  | Observations. |
| panel_items | status | ENUM |  | ACTIVE/INACTIVE. |
| orders | id | INT | PK | Order id. |
| orders | orderDate | DATETIME |  | Creation timestamp. |
| orders | state | ENUM(CREADA,...,ANULADA) |  | Workflow state. |
| orders | priority | ENUM(RUTINA,URGENTE) |  | SLA bucket. |
| orders | patientId | INT | FK→patients.id | Patient owning the order. |
| orders | doctorId | INT | FK→doctors.id | Ordering doctor. |
| orders | insuranceId | INT | FK→insurances.id | Insurance used. |
| orders | netTotal | DECIMAL(12,2) |  | Financial total. |
| orders | observations | TEXT |  | Notes. |
| orders | status | ENUM |  | ACTIVE/INACTIVE record. |
| order_items | id | INT | PK | Order item id. |
| order_items | orderId | INT | FK→orders.id | Parent order. |
| order_items | examId | INT | FK→exams.id | Catalog exam. |
| order_items | code | VARCHAR |  | Denormalized exam code. |
| order_items | name | VARCHAR |  | Denormalized exam name. |
| order_items | price | DECIMAL(10,2) |  | Item price. |
| order_items | state | ENUM(PENDIENTE,...,ANULADO) |  | Item workflow state. |
| order_items | status | ENUM |  | ACTIVE/INACTIVE. |
| samples | id | INT | PK | Sample id. |
| samples | orderId | INT | FK→orders.id | Order reference. |
| samples | type | VARCHAR |  | Specimen type label. |
| samples | barcode | VARCHAR |  | Tracking barcode. |
| samples | drawDate | DATETIME |  | Collection time. |
| samples | state | ENUM(RECOLECTADA,...,ANULADA) |  | Sample workflow. |
| samples | observations | TEXT |  | Notes. |
| samples | status | ENUM |  | ACTIVE/INACTIVE. |
| results | id | INT | PK | Result id. |
| results | orderId | INT | FK→orders.id | Order reference. |
| results | sampleId | INT | FK→samples.id | Sample reference. |
| results | examId | INT | FK→exams.id | Exam reference. |
| results | parameterId | INT | FK→parameters.id | Parameter reference. |
| results | numValue | DECIMAL(18,6) |  | Numeric measurement. |
| results | textValue | VARCHAR(200) |  | Textual measurement. |
| results | outRange | BOOLEAN |  | Out-of-range indicator. |
| results | dateResult | DATETIME |  | Result timestamp. |
| results | validatedForId | INT | FK→doctors.id | Validator doctor. |
| results | validatedFor | VARCHAR |  | Snapshot of validator name. |
| results | method | VARCHAR |  | Method snapshot. |
| results | units | VARCHAR |  | Unit snapshot. |
| results | comment | TEXT |  | Interpretative comment. |
| results | resultState | ENUM(PENDIENTE,VALIDADO,RECHAZADO) |  | Validation status. |
| results | status | ENUM |  | ACTIVE/INACTIVE record. |

## 4. Use Cases – CRUD

### 4.1 Use Case: Create Patient
Actor:\
Description:\ Laboratory receptionist or administrative staff registers a new patient before creating an order.\
Preconditions:\ Actor is authenticated with role ADMIN or STAFF; patient record does not already exist; insurance catalog is loaded.\
Postconditions:\ Patient record is created, linked to an auto-generated user account, and optionally associated with an insurance.\
Main Flow:
1. Actor opens the Angular route `administracion/pacientes` and clicks "Nuevo paciente".
2. The UI displays the reactive form with identity and contact fields populated by dropdown catalogs (docType, gender, insurance).
3. Actor fills minimum required data (firstName, lastName, docType, docNumber) and optional coverage details.
4. Frontend calls `POST /api/paciente` with the payload; backend validates duplicates and creates the Patient row.
5. Patient hook creates the associated User, RoleUser, and optional insurance relation; API returns 201 with the saved entity.
6. Frontend refreshes patient list and shows a success message.

### 4.2 Use Case: Read Patient
Actor:\
Description:\ Staff retrieves patient data to confirm demographics or review insurance information.\
Preconditions:\ Actor is logged in; at least one patient exists.\
Postconditions:\ Requested patient data is shown in the UI or an error is displayed.\
Main Flow:
1. Actor visits `administracion/pacientes` (guarded route).
2. `PatientsService.ensureLoaded()` fetches `/api/pacientes` and `/api/patientinsurances` in parallel.
3. Data tables (PrimeNG) display filtered patients and coverage details.
4. Actor can search, paginate, or open details; selecting a patient calls `GET /api/paciente/:id` for the latest data.
5. The UI renders the read-only panel or detail drawer.

### 4.3 Use Case: Update Patient
Actor:\
Description:\ Staff updates contact info or toggles the logical status after verifying documentation.\
Preconditions:\ Patient exists in ACTIVE state; actor is authenticated with edit permissions.\
Postconditions:\ Patient record is updated, audit log (morgan + console) captures the action, and caches refresh.\
Main Flow:
1. Actor selects "Editar" inside a patient row.
2. Angular form loads current data using `GET /api/paciente/:id` and binds to form controls.
3. Actor modifies the necessary fields and submits.
4. UI calls `PATCH /api/paciente/:id` with changed values; backend validates docNumber uniqueness and persists.
5. If insurance changed, service calls `PATCH /api/paciente/:id/logic` or patient-insurance sync endpoints to realign relations.
6. Updated item is merged in the BehaviorSubject and UI reflects the change.

### 4.4 Use Case: Delete Patient
Actor:\
Description:\ Staff performs logical deletion when a patient should not appear in searches but must be retained historically.\
Preconditions:\ Patient exists; actor has delete scope.\
Postconditions:\ Patient status switches to INACTIVE and disappears from ACTIVE listings.\
Main Flow:
1. Actor clicks "Desactivar" icon.
2. System asks for confirmation; on acceptance, UI issues `PATCH /api/paciente/:id/logic`.
3. Backend updates `status` to INACTIVE and responds 200.
4. UI filters the BehaviorSubject to remove the patient and shows confirmation feedback.

### 4.5 Use Case: Create Order
Actor:\
Description:\ Laboratory receptionist registers a medical order requested by a doctor to kick off pricing, sample collection, and results tracking.\
Preconditions:\ Actor is authenticated, patient and doctor records exist, exam catalog and insurance list are loaded.\
Postconditions:\ Order row plus its order items are created and linked to patient, doctor, and insurance.\
Main Flow:
1. Actor opens `operacion/ordenes` and clicks "Nueva orden".
2. Form pulls `PatientsService`, `DoctorsService`, `ExamsService`, and insurance BehaviorSubjects to populate selectors.
3. Actor selects patient/doctor, adds requested exams (dataview + autocomplete), chooses priority, and fills observations.
4. Frontend composes payload with header (order meta) and lines (exam IDs) and calls `POST /api/orden`.
5. Backend validates coverage, calculates totals, persists order + order_items transactionally, and responds 201.
6. UI reloads the orders table and emits toast confirming creation; workflow state defaults to `CREADA`.

### 4.6 Use Case: Read Order
Actor:\
Description:\ Staff reviews pending or historical orders to verify scope, billing, or workflow state.\
Preconditions:\ Actor logged in with view scope; at least one order exists.\
Postconditions:\ Order data including items and totals is displayed or notifies if order not found.\
Main Flow:
1. Actor navigates to `operacion/ordenes`.
2. Component resolves guard, then `OrdersService.ensureLoaded()` performs `GET /api/ordenes` with filters (state, patient, date).
3. PrimeNG table shows results with column templates for patient, insurance, priority, totals, and status badges.
4. Selecting a row fetches `GET /api/orden/:id` to refresh items, samples, and results timeline in the side panel.
5. UI renders read-only summary, including action buttons depending on RBAC scopes.

### 4.7 Use Case: Update Order
Actor:\
Description:\ Staff updates exams, insurance selection, or state (e.g., moving to `EN_ESPERA_MUESTRA`) prior to fulfillment.\
Preconditions:\ Order exists in modifiable state; actor has edit permissions.\
Postconditions:\ Order header/items are updated and logs reflect the modification.\
Main Flow:
1. Actor clicks "Editar" inside the order row.
2. Component retrieves order snapshot via `GET /api/orden/:id` and binds values to the reactive form.
3. Actor adds/removes exams or toggles workflow state/priorities and submits.
4. UI sends `PATCH /api/orden/:id` with delta (header + array of updated order_items).
5. Controller validates transitions, recalculates totals, persists changes, and emits domain events (notifications/toasts).
6. BehaviorSubject merges updated order to keep list synchronized without full reload.

### 4.8 Use Case: Delete Order
Actor:\
Description:\ Administrator or supervisor logically cancels an order when it should not proceed (duplicated, incorrectly created).\
Preconditions:\ Order exists and is cancelable; actor owns delete/cancel scope.\
Postconditions:\ Order state flips to `ANULADA`, preventing further processing.\
Main Flow:
1. Actor presses "Anular" button in the order detail drawer.
2. Confirmation dialog appears; once accepted, UI issues `PATCH /api/orden/:id/cancel`.
3. Backend validates that no samples/results are finalized, updates state/status fields, and registers audit info.
4. Orders list filters out canceled entry, and notifications inform stakeholders.

### 4.9 Use Case: Create Sample
Actor:\
Description:\ Phlebotomist or lab technician records the specimen collected for an existing order.\
Preconditions:\ Order exists in a state that allows sample collection; actor authenticated with LAB role; barcode generator configured.\
Postconditions:\ Sample record is tied to the order, with barcode/metadata stored for traceability.\
Main Flow:
1. Actor opens `operacion/muestras` or the Samples tab within an order detail.
2. UI preloads sample types catalog and pulls order context (patient, exams, pending items).
3. Actor chooses specimen type, inputs draw date/time, adds observations, and scans or generates barcode.
4. UI issues `POST /api/muestra` with orderId, type, barcode, state `RECOLECTADA`, and metadata.
5. Backend persists the sample, associates pending order items, and responds 201.
6. Samples grid updates immediately so staff can print labels or proceed to processing.

### 4.10 Use Case: Read Sample
Actor:\
Description:\ Lab personnel review collected specimens to monitor chain of custody and readiness for analysis.\
Preconditions:\ Samples exist for the selected order or filters.\
Postconditions:\ Sample records (including state timeline) are displayed; missing samples trigger empty-state guidance.\
Main Flow:
1. Actor navigates to `operacion/muestras` or the sample tab in order detail.
2. Service executes `GET /api/muestras` or `GET /api/orden/:id/muestras` filtering by order, state, or date.
3. PrimeNG list shows barcode, type, draw date, and state tags; selecting one displays additional metadata and attachments.
4. Component subscribes to WebSocket or polling updates so status badges change in near real-time.
5. If no samples exist, the UI surfaces CTA to "Registrar muestra" with context-specific messaging.

### 4.11 Use Case: Update Sample
Actor:\
Description:\ Technician updates sample status (e.g., `EN_PROCESO`, `RECHAZADA`) or corrects metadata after verification.\
Preconditions:\ Sample exists; actor with edit scope; state transition rules met.\
Postconditions:\ Sample record reflects new data, and downstream modules (results, logistics) are notified.\
Main Flow:
1. Actor selects sample and clicks "Editar" or uses status action buttons (chips).
2. Component fetches latest record via `GET /api/muestra/:id` to avoid stale writes.
3. Actor adjusts fields (state, drawDate, observations, storage location) and submits.
4. UI sends `PATCH /api/muestra/:id` or state-specific endpoint (e.g., `/transition`) with delta.
5. Backend validates transition (e.g., cannot set to `ENTREGADA` if no results), persists changes, and triggers notifications.
6. Sample list refreshes entry inline, while event bus informs other widgets (result capture, logistics).

### 4.12 Use Case: Delete Sample
Actor:\
Description:\ Supervisor performs logical deletion or invalidation when a sample was registered in error and must be excluded from processing.\
Preconditions:\ Sample exists, not yet tied to validated results; actor has delete permission.\
Postconditions:\ Sample status marked as INACTIVE/ANULADA and excluded from workflows.\
Main Flow:
1. Actor presses "Anular muestra" inside the sample drawer.
2. Confirmation prompts for reason; upon accept, UI calls `PATCH /api/muestra/:id/logic`.
3. Backend verifies dependencies (no released results), updates status, and logs reason.
4. UI removes sample from active lists and may prompt to register a replacement specimen.

## 5. Backend Documentation

### 5.1 Backend Architecture
- `src/config/App` composes Express, loads environment variables, sets middleware (morgan, cors, JSON body parsing), registers routes, syncs Sequelize, and binds error handlers.
- Routes are defined as small classes under `src/routes`, each wiring an Express Router to its controller and optionally applying `authMiddleware` for protected paths.
- Controllers under `src/controllers` encapsulate business rules (validation, sequencing) and interact with Sequelize models (`src/database/models`).
- Middleware handles authentication (JWT validation, RBAC), error translation, and shared logic.
- Sequelize centralizes database connections in `src/database/db.ts`, enabling engine switching via `DB_ENGINE` environment variable.

### 5.2 Folder Structure

```txt
backend/
├── src/
│   ├── config/
│   │   └── index.ts
│   ├── controllers/
│   │   ├── auth/
│   │   │   ├── auth-controller.ts
│   │   │   ├── refreshToken-controller.ts
│   │   │   ├── resource-controller.ts
│   │   │   ├── resourceRole-controller.ts
│   │   │   ├── role-controller.ts
│   │   │   ├── roleUser-controller.ts
│   │   │   └── user-controller.ts
│   │   ├── doctor-controller.ts
│   │   ├── exam-controller.ts
│   │   ├── insurance-controller.ts
│   │   ├── order-controller.ts
│   │   ├── orderitem-controller.ts
│   │   ├── panel-controller.ts
│   │   ├── panelitem-controller.ts
│   │   ├── parameter-controller.ts
│   │   ├── patient-controller.ts
│   │   ├── patientinsurance-controller.ts
│   │   ├── result-controller.ts
│   │   └── sample-controller.ts
│   ├── database/
│   │   ├── db.ts
│   │   └── models/
│   │       ├── auth/
│   │       │   ├── RefreshToken.ts
│   │       │   ├── Resource.ts
│   │       │   ├── ResourceRole.ts
│   │       │   ├── Role.ts
│   │       │   ├── RoleUser.ts
│   │       │   └── User.ts
│   │       ├── Doctor.ts
│   │       ├── Exam.ts
│   │       ├── Insurance.ts
│   │       ├── Order.ts
│   │       ├── OrderItem.ts
│   │       ├── Panel.ts
│   │       ├── PanelItem.ts
│   │       ├── Parameter.ts
│   │       ├── Patient.ts
│   │       ├── PatientInsurance.ts
│   │       ├── Result.ts
│   │       ├── Sample.ts
│   │       └── associations.ts
│   ├── faker/
│   │   └── populate_data.ts
│   ├── http/
│   │   ├── auth/
│   │   │   ├── auth.http
│   │   │   ├── refreshTokens.http
│   │   │   ├── resourceRoles.http
│   │   │   ├── resources.http
│   │   │   ├── roleUsers.http
│   │   │   ├── roles.http
│   │   │   └── users.http
│   │   ├── doctor.http
│   │   ├── exam.http
│   │   ├── index.http
│   │   ├── insurance.http
│   │   ├── order.http
│   │   ├── orderitem.http
│   │   ├── panel.http
│   │   ├── panelitem.http
│   │   ├── parameter.http
│   │   ├── patient.http
│   │   ├── patientinsurance.http
│   │   ├── result.http
│   │   ├── sample.http
│   │   └── user.http
│   ├── middleware/
│   │   └── auth.ts
│   ├── routes/
│   │   ├── auth/
│   │   │   ├── auth.ts
│   │   │   ├── refreshToken.ts
│   │   │   ├── resource.ts
│   │   │   ├── resourceRole.ts
│   │   │   ├── role.ts
│   │   │   ├── roleUser.ts
│   │   │   └── users.ts
│   │   ├── doctor.ts
│   │   ├── exam.ts
│   │   ├── index.ts
│   │   ├── insurance.ts
│   │   ├── order.ts
│   │   ├── orderitem.ts
│   │   ├── panel.ts
│   │   ├── panelitem.ts
│   │   ├── parameter.ts
│   │   ├── patient.ts
│   │   ├── patientinsurance.ts
│   │   ├── result.ts
│   │   └── sample.ts
│   └── server.ts
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── tsconfig.json
└── node_modules/ (external dependencies installed via npm)
```

> Note: `node_modules/` contains only third-party packages generated during installation; it is referenced but not expanded to preserve readability.

### 5.3 API Documentation (REST)
Below is a practical CRUD summary for the main resources. Unless noted otherwise, every endpoint requires a valid JWT token.

**Patients (pacientes, JWT required)**  
Method Path: `GET /api/pacientes`  
Purpose: List all patients.  
Responses:  
200 OK (example):

```json
[
  {
    "id": 1,
    "firstName": "Laura",
    "lastName": "Gomez",
    "docType": "CC",
    "docNumber": "1056874210",
    "gender": "F",
    "email": "laura.gomez@example.com",
    "phone": "+57 3001234567",
    "status": "ACTIVE",
    "createdAt": "2024-10-13T19:20:22.000Z",
    "updatedAt": "2024-11-16T03:02:22.000Z"
  }
]
```

Method Path: `POST /api/paciente`  
Purpose: Create a patient record.  
Request Body Example:

```json
{
  "firstName": "Laura",
  "lastName": "Gomez",
  "docType": "CC",
  "docNumber": "1056874210",
  "birthDate": "1995-04-18",
  "gender": "F",
  "phone": "+57 3001234567",
  "email": "laura.gomez@example.com",
  "address": "Cra 10 #25-18",
  "insuranceId": 3,
  "status": "ACTIVE"
}
```

Responses:  
201 Created (example) returns stored fields plus generated `id`/`userId`.

Method Path: `GET /api/paciente/:id`  
Purpose: Fetch patient detail.  
Responses: 200 OK (patient JSON) or 404 Not Found.

Method Path: `PATCH /api/paciente/:id`  
Purpose: Update demographics or insurance.  
Request Body Example:

```json
{
  "phone": "+57 3027896541",
  "address": "Calle 80 #12-45",
  "status": "ACTIVE"
}
```

Responses: 200 OK (example returns updated row).

Method Path: `PATCH /api/paciente/:id/logic`  
Purpose: Logical delete (set status INACTIVE).  
Responses: 200 OK (example): `{ "message": "Paciente desactivado" }`

---

**Doctors (doctores, JWT required)**  
Method Path: `GET /api/doctores`  
Purpose: List registered doctors.  
Responses: 200 OK (array with specialty/contact info).

Method Path: `POST /api/doctor`  
Purpose: Register a doctor.  
Request Body Example:

```json
{
  "firstName": "Carlos",
  "lastName": "Lopez",
  "licenseNumber": "MED-25478",
  "specialty": "Hematology",
  "email": "carlos.lopez@clinic.com",
  "phone": "+57 3201112233",
  "status": "ACTIVE"
}
```

Responses: 201 Created (doctor JSON).

Method Path: `GET /api/doctor/:id` – Purpose: Fetch detail.  
Method Path: `PATCH /api/doctor/:id` – Purpose: Update specialty/contact.  
Method Path: `PATCH /api/doctor/:id/logic` – Purpose: Logical delete.  
Responses: 200 OK on success.

---

**Exams (exámenes, JWT required)**  
Method Path: `GET /api/examenes`  
Purpose: List catalog exams.  
Responses: 200 OK (example):

```json
{
  "id": 12,
  "code": "HB001",
  "name": "Hemograma completo",
  "method": "Automated",
  "specimenType": "SANGRE",
  "processingTimeMin": 45,
  "priceBase": 45000,
  "status": "ACTIVE",
  "createdAt": "2024-08-12T15:05:00.000Z",
  "updatedAt": "2024-10-02T21:10:11.000Z"
}
```

Method Path: `POST /api/examen` – Purpose: Create an exam.  
Method Path: `GET /api/examen/:id` – Purpose: Fetch exam detail.  
Method Path: `PUT /api/examen/:id` – Purpose: Update exam metadata.  
Method Path: `PATCH /api/examen/:id/logic` – Purpose: Logical delete.  
Responses: 201 for POST, 200 for read/update/delete.

---

**Orders (órdenes, JWT required)**  
Method Path: `GET /api/ordenes`  
Purpose: List orders with related patient/doctor data.  
Responses: 200 OK (example):

```json
[
  {
    "id": 101,
    "orderDate": "2024-11-18T14:22:10.000Z",
    "state": "CREADA",
    "priority": "RUTINA",
    "patientId": 1,
    "doctorId": 5,
    "insuranceId": 3,
    "netTotal": 120000,
    "observations": "Ayuno de 8h",
    "orderItems": [
      { "examId": 12, "name": "Hemograma", "price": 45000 },
      { "examId": 18, "name": "Perfil Lipídico", "price": 75000 }
    ]
  }
]
```

Method Path: `POST /api/orden`  
Purpose: Create an order with items.  
Request Body Example:

```json
{
  "patientId": 1,
  "doctorId": 5,
  "insuranceId": 3,
  "priority": "RUTINA",
  "observations": "Ayuno de 8h",
  "items": [
    { "examId": 12 },
    { "examId": 18 }
  ]
}
```

Responses: 201 Created (returns header + `orderItems`).

Method Path: `GET /api/orden/:id` – Purpose: Fetch full order detail.  
Method Path: `PATCH /api/orden/:id` – Purpose: Update workflow fields or items.  
Method Path: `PATCH /api/orden/:id/cancel` – Purpose: Logical cancel (state ANULADA).  
Responses: 200 OK on success.

---

**Samples (muestras, JWT required)**  
Method Path: `GET /api/muestras`  
Purpose: List collected samples (supports filters).  
Responses: 200 OK with barcode/type/state info.

Method Path: `POST /api/muestra`  
Purpose: Register a sample for an order.  
Request Body Example:

```json
{
  "orderId": 101,
  "type": "SANGRE VENOSA",
  "barcode": "LAB-20241118-0001",
  "drawDate": "2024-11-18T15:00:00.000Z",
  "state": "RECOLECTADA",
  "observations": "Sin incidentes"
}
```

Responses: 201 Created (sample JSON).

Method Path: `GET /api/muestra/:id` – Purpose: Fetch detail.  
Method Path: `PATCH /api/muestra/:id` – Purpose: Update metadata or transition state.  
Method Path: `PATCH /api/muestra/:id/logic` – Purpose: Logical delete.  
Responses: 200 OK or 404 accordingly.

---

**Results (resultados, JWT required)**  
Method Path: `GET /api/resultados`  
Purpose: List parameter results.  
Responses: 200 OK (example):

```json
{
  "id": 500,
  "orderId": 101,
  "sampleId": 32,
  "examId": 12,
  "parameterId": 77,
  "value": "13.8",
  "unit": "g/dL",
  "refMin": 12,
  "refMax": 16,
  "state": "VALIDADO",
  "releasedAt": "2024-11-19T09:45:00.000Z"
}
```

Method Path: `POST /api/resultado`  
Purpose: Capture a measurement.  
Request Body Example:

```json
{
  "orderId": 101,
  "sampleId": 32,
  "examId": 12,
  "parameterId": 77,
  "value": "13.8",
  "state": "BORRADOR"
}
```

Responses: 201 Created (result JSON).

Method Path: `GET /api/resultado/:id` – Purpose: Fetch detail.  
Method Path: `PATCH /api/resultado/:id` – Purpose: Update value/state (e.g., VALIDADO).  
Method Path: `DELETE /api/resultado/:id` – Purpose: Physical delete before release.  
Responses: 200 OK (update), 200/204 OK (delete) or 404 if not found.

---

**Users (usuarios, JWT required)**  
Method Path: `GET /api/auth/users`  
Purpose: List portal accounts with their roles.  
Responses: 200 OK (array).

Method Path: `POST /api/auth/users`  
Purpose: Create an administrative/staff user.  
Request Body Example:

```json
{
  "username": "admin.lab",
  "password": "S3guro#2024",
  "roleId": 1,
  "status": "ACTIVE"
}
```

Responses: 201 Created (user JSON without password hash).

Method Path: `GET /api/auth/users/:id` – Purpose: Fetch detail.  
Method Path: `PATCH /api/auth/users/:id` – Purpose: Update password/status/role.  
Method Path: `PATCH /api/auth/users/:id/deactivate` – Purpose: Logical delete.  
Auth-only endpoints (`POST /api/auth/login`, `POST /api/auth/refresh`) are the exceptions that accept credentials without prior JWT.

---

**Insurances (aseguradoras, JWT required)**  
Method Path: `GET /api/aseguradoras`  
Purpose: List insurance providers.  
Responses: 200 OK (array).

Method Path: `POST /api/aseguradora`  
Purpose: Create an insurance.  
Request Body Example:

```json
{
  "name": "Salud Total",
  "nit": "900123456",
  "phone": "+57 6011234567",
  "email": "contacto@saludtotal.com",
  "address": "Cra 13 #45-10",
  "status": "ACTIVE"
}
```

Responses: 201 Created (insurance JSON).

Method Path: `GET /api/aseguradora/:id` – Purpose: Fetch detail.  
Method Path: `PATCH /api/aseguradora/:id` – Purpose: Update contact/status.  
Method Path: `PATCH /api/aseguradora/:id/logic` – Purpose: Logical delete.  
Responses: 200 OK or 404 if not found.

### 5.4 REST Client
Each resource has an `.http` file under `backend/src/http`. For example, `backend/src/http/patient.http` bundles GET/POST/PATCH/DELETE requests ready for VS Code REST Client or the Thunder Client plugin. Environment variables use the `@baseUrl` placeholder, simplifying manual regression testing without leaving the IDE.

## 6. Frontend Documentation

### 6.1 Technical Frontend Documentation
Framework Used:\ Angular 20.1 (standalone components) with PrimeNG 20, Tailwind 4, RxJS 7, Chart.js 4, and Angular Router guards/interceptors.\
Folder Structure:

```txt
pyrLabClinico/
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
├── public/
│   ├── landing/
│   │   ├── coagulacion.jpg
│   │   ├── hematologia.jpg
│   │   ├── infecciosas.jpg
│   │   ├── inmunologia.png
│   │   ├── landing-1.jpg
│   │   ├── micro.png
│   │   ├── microscopio.jpg
│   │   ├── quimica.jpg
│   │   └── video.jpg
│   ├── favicon.ico
│   ├── logo.jpg
│   ├── logo.png
│   ├── logo_collapsed.png
│   └── user_icon.png
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── auth.guard.ts
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── authservice.spec.ts
│   │   │   ├── authservice.ts
│   │   │   ├── session-service.spec.ts
│   │   │   └── session-service.ts
│   │   ├── components/
│   │   │   ├── doctors/
│   │   │   │   ├── all-doctors/
│   │   │   │   │   ├── all-doctors.css
│   │   │   │   │   ├── all-doctors.html
│   │   │   │   │   ├── all-doctors.spec.ts
│   │   │   │   │   └── all-doctors.ts
│   │   │   │   ├── create-doctor/
│   │   │   │   │   ├── create-doctor.css
│   │   │   │   │   ├── create-doctor.html
│   │   │   │   │   ├── create-doctor.spec.ts
│   │   │   │   │   └── create-doctor.ts
│   │   │   │   ├── update-doctor/
│   │   │   │   │   ├── update-doctor.css
│   │   │   │   │   ├── update-doctor.html
│   │   │   │   │   ├── update-doctor.spec.ts
│   │   │   │   │   └── update-doctor.ts
│   │   │   │   └── view-doctor/
│   │   │   │       ├── view-doctor.css
│   │   │   │       ├── view-doctor.html
│   │   │   │       ├── view-doctor.spec.ts
│   │   │   │       └── view-doctor.ts
│   │   │   ├── exams/
│   │   │   │   ├── all-exams/
│   │   │   │   │   ├── all-exams.css
│   │   │   │   │   ├── all-exams.html
│   │   │   │   │   ├── all-exams.spec.ts
│   │   │   │   │   └── all-exams.ts
│   │   │   │   ├── create-exam/
│   │   │   │   │   ├── create-exam.css
│   │   │   │   │   ├── create-exam.html
│   │   │   │   │   ├── create-exam.spec.ts
│   │   │   │   │   └── create-exam.ts
│   │   │   │   ├── update-exam/
│   │   │   │   │   ├── update-exam.css
│   │   │   │   │   ├── update-exam.html
│   │   │   │   │   ├── update-exam.spec.ts
│   │   │   │   │   └── update-exam.ts
│   │   │   │   └── view-exam/
│   │   │   │       ├── view-exam.css
│   │   │   │       ├── view-exam.html
│   │   │   │       ├── view-exam.spec.ts
│   │   │   │       └── view-exam.ts
│   │   │   ├── insurances/
│   │   │   │   ├── all-insurances/
│   │   │   │   │   ├── all-insurances.css
│   │   │   │   │   ├── all-insurances.html
│   │   │   │   │   ├── all-insurances.spec.ts
│   │   │   │   │   └── all-insurances.ts
│   │   │   │   ├── create-insurance/
│   │   │   │   │   ├── create-insurance.css
│   │   │   │   │   ├── create-insurance.html
│   │   │   │   │   ├── create-insurance.spec.ts
│   │   │   │   │   └── create-insurance.ts
│   │   │   │   ├── update-insurance/
│   │   │   │   │   ├── update-insurance.css
│   │   │   │   │   ├── update-insurance.html
│   │   │   │   │   ├── update-insurance.spec.ts
│   │   │   │   │   └── update-insurance.ts
│   │   │   │   └── view-insurance/
│   │   │   │       ├── view-insurance.css
│   │   │   │       ├── view-insurance.html
│   │   │   │       ├── view-insurance.spec.ts
│   │   │   │       └── view-insurance.ts
│   │   │   ├── layout/
│   │   │   │   ├── aside/
│   │   │   │   │   ├── aside.css
│   │   │   │   │   ├── aside.html
│   │   │   │   │   ├── aside.spec.ts
│   │   │   │   │   └── aside.ts
│   │   │   │   ├── content/
│   │   │   │   │   ├── content.css
│   │   │   │   │   ├── content.html
│   │   │   │   │   ├── content.spec.ts
│   │   │   │   │   └── content.ts
│   │   │   │   ├── footer/
│   │   │   │   │   ├── footer.css
│   │   │   │   │   ├── footer.html
│   │   │   │   │   ├── footer.spec.ts
│   │   │   │   │   └── footer.ts
│   │   │   │   └── header/
│   │   │   │       ├── header.css
│   │   │   │       ├── header.html
│   │   │   │       ├── header.spec.ts
│   │   │   │       └── header.ts
│   │   │   ├── order-items/
│   │   │   │   ├── all-orit/
│   │   │   │   │   ├── all-orit.css
│   │   │   │   │   ├── all-orit.html
│   │   │   │   │   ├── all-orit.spec.ts
│   │   │   │   │   └── all-orit.ts
│   │   │   │   ├── create-orit/
│   │   │   │   │   ├── create-orit.css
│   │   │   │   │   ├── create-orit.html
│   │   │   │   │   ├── create-orit.spec.ts
│   │   │   │   │   └── create-orit.ts
│   │   │   │   ├── update-orit/
│   │   │   │   │   ├── update-orit.css
│   │   │   │   │   ├── update-orit.html
│   │   │   │   │   ├── update-orit.spec.ts
│   │   │   │   │   └── update-orit.ts
│   │   │   │   └── view-orit/
│   │   │   │       ├── view-orit.css
│   │   │   │       ├── view-orit.html
│   │   │   │       ├── view-orit.spec.ts
│   │   │   │       └── view-orit.ts
│   │   │   ├── orders/
│   │   │   │   ├── all-order/
│   │   │   │   │   ├── all-order.css
│   │   │   │   │   ├── all-order.html
│   │   │   │   │   ├── all-order.spec.ts
│   │   │   │   │   └── all-order.ts
│   │   │   │   ├── create-order/
│   │   │   │   │   ├── create-order.css
│   │   │   │   │   ├── create-order.html
│   │   │   │   │   ├── create-order.spec.ts
│   │   │   │   │   └── create-order.ts
│   │   │   │   ├── update-order/
│   │   │   │   │   ├── update-order.css
│   │   │   │   │   ├── update-order.html
│   │   │   │   │   ├── update-order.spec.ts
│   │   │   │   │   └── update-order.ts
│   │   │   │   └── view-order/
│   │   │   │       ├── view-order.css
│   │   │   │       ├── view-order.html
│   │   │   │       ├── view-order.spec.ts
│   │   │   │       └── view-order.ts
│   │   │   ├── pages/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── dashboard.css
│   │   │   │   │   ├── dashboard.html
│   │   │   │   │   ├── dashboard.spec.ts
│   │   │   │   │   └── dashboard.ts
│   │   │   │   ├── home/
│   │   │   │   │   ├── home.css
│   │   │   │   │   ├── home.html
│   │   │   │   │   ├── home.spec.ts
│   │   │   │   │   └── home.ts
│   │   │   │   ├── landing-page/
│   │   │   │   │   ├── landing-page.css
│   │   │   │   │   ├── landing-page.html
│   │   │   │   │   ├── landing-page.spec.ts
│   │   │   │   │   └── landing-page.ts
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.css
│   │   │   │   │   ├── login.html
│   │   │   │   │   ├── login.spec.ts
│   │   │   │   │   └── login.ts
│   │   │   │   ├── not-found/
│   │   │   │   │   ├── not-found.css
│   │   │   │   │   ├── not-found.html
│   │   │   │   │   ├── not-found.spec.ts
│   │   │   │   │   └── not-found.ts
│   │   │   │   ├── profile/
│   │   │   │   │   ├── profile.css
│   │   │   │   │   ├── profile.html
│   │   │   │   │   ├── profile.spec.ts
│   │   │   │   │   └── profile.ts
│   │   │   │   ├── repository/
│   │   │   │   │   ├── repository.css
│   │   │   │   │   ├── repository.html
│   │   │   │   │   ├── repository.spec.ts
│   │   │   │   │   └── repository.ts
│   │   │   │   └── soon-page/
│   │   │   │       ├── soon-page.css
│   │   │   │       ├── soon-page.html
│   │   │   │       ├── soon-page.spec.ts
│   │   │   │       └── soon-page.ts
│   │   │   ├── panel/
│   │   │   │   ├── all-panels/
│   │   │   │   │   ├── all-panels.css
│   │   │   │   │   ├── all-panels.html
│   │   │   │   │   ├── all-panels.spec.ts
│   │   │   │   │   └── all-panels.ts
│   │   │   │   ├── create-panel/
│   │   │   │   │   ├── create-panel.css
│   │   │   │   │   ├── create-panel.html
│   │   │   │   │   ├── create-panel.spec.ts
│   │   │   │   │   └── create-panel.ts
│   │   │   │   ├── update-panel/
│   │   │   │   │   ├── update-panel.css
│   │   │   │   │   ├── update-panel.html
│   │   │   │   │   ├── update-panel.spec.ts
│   │   │   │   │   └── update-panel.ts
│   │   │   │   └── view-panel/
│   │   │   │       ├── view-panel.css
│   │   │   │       ├── view-panel.html
│   │   │   │       ├── view-panel.spec.ts
│   │   │   │       └── view-panel.ts
│   │   │   ├── parameters/
│   │   │   │   ├── all-parameters/
│   │   │   │   │   ├── all-parameters.css
│   │   │   │   │   ├── all-parameters.html
│   │   │   │   │   ├── all-parameters.spec.ts
│   │   │   │   │   └── all-parameters.ts
│   │   │   │   ├── create-parameter/
│   │   │   │   │   ├── create-parameter.css
│   │   │   │   │   ├── create-parameter.html
│   │   │   │   │   ├── create-parameter.spec.ts
│   │   │   │   │   └── create-parameter.ts
│   │   │   │   ├── update-parameter/
│   │   │   │   │   ├── update-parameter.css
│   │   │   │   │   ├── update-parameter.html
│   │   │   │   │   ├── update-parameter.spec.ts
│   │   │   │   │   └── update-parameter.ts
│   │   │   │   └── view-parameter/
│   │   │   │       ├── view-parameter.css
│   │   │   │       ├── view-parameter.html
│   │   │   │       ├── view-parameter.spec.ts
│   │   │   │       └── view-parameter.ts
│   │   │   ├── patients/
│   │   │   │   ├── all-patients/
│   │   │   │   │   ├── all-patients.css
│   │   │   │   │   ├── all-patients.html
│   │   │   │   │   ├── all-patients.spec.ts
│   │   │   │   │   └── all-patients.ts
│   │   │   │   ├── create-patient/
│   │   │   │   │   ├── create-patient.css
│   │   │   │   │   ├── create-patient.html
│   │   │   │   │   ├── create-patient.spec.ts
│   │   │   │   │   └── create-patient.ts
│   │   │   │   ├── update-patient/
│   │   │   │   │   ├── update-patient.css
│   │   │   │   │   ├── update-patient.html
│   │   │   │   │   ├── update-patient.spec.ts
│   │   │   │   │   └── update-patient.ts
│   │   │   │   └── view-patient/
│   │   │   │       ├── view-patient.css
│   │   │   │       ├── view-patient.html
│   │   │   │       ├── view-patient.spec.ts
│   │   │   │       └── view-patient.ts
│   │   │   ├── results/
│   │   │   │   ├── all-result/
│   │   │   │   │   ├── all-result.css
│   │   │   │   │   ├── all-result.html
│   │   │   │   │   ├── all-result.spec.ts
│   │   │   │   │   └── all-result.ts
│   │   │   │   ├── create-result/
│   │   │   │   │   ├── create-result.css
│   │   │   │   │   ├── create-result.html
│   │   │   │   │   ├── create-result.spec.ts
│   │   │   │   │   └── create-result.ts
│   │   │   │   ├── update-result/
│   │   │   │   │   ├── update-result.css
│   │   │   │   │   ├── update-result.html
│   │   │   │   │   ├── update-result.spec.ts
│   │   │   │   │   └── update-result.ts
│   │   │   │   ├── validated-result/
│   │   │   │   │   ├── validated-result.css
│   │   │   │   │   ├── validated-result.html
│   │   │   │   │   ├── validated-result.spec.ts
│   │   │   │   │   └── validated-result.ts
│   │   │   │   └── view-result/
│   │   │   │       ├── view-result.css
│   │   │   │       ├── view-result.html
│   │   │   │       ├── view-result.spec.ts
│   │   │   │       └── view-result.ts
│   │   │   └── samples/
│   │   │       ├── all-sample/
│   │   │       │   ├── all-sample.css
│   │   │       │   ├── all-sample.html
│   │   │       │   ├── all-sample.spec.ts
│   │   │       │   └── all-sample.ts
│   │   │       ├── create-sample/
│   │   │       │   ├── create-sample.css
│   │   │       │   ├── create-sample.html
│   │   │       │   ├── create-sample.spec.ts
│   │   │       │   └── create-sample.ts
│   │   │       ├── track-samples/
│   │   │       │   ├── track-samples.css
│   │   │       │   ├── track-samples.html
│   │   │       │   ├── track-samples.spec.ts
│   │   │       │   └── track-samples.ts
│   │   │       ├── update-sample/
│   │   │       │   ├── update-sample.css
│   │   │       │   ├── update-sample.html
│   │   │       │   ├── update-sample.spec.ts
│   │   │       │   └── update-sample.ts
│   │   │       └── view-sample/
│   │   │           ├── view-sample.css
│   │   │           ├── view-sample.html
│   │   │           ├── view-sample.spec.ts
│   │   │           └── view-sample.ts
│   │   ├── models/
│   │   │   ├── doctor-model.ts
│   │   │   ├── exam-model.ts
│   │   │   ├── insurance-model.ts
│   │   │   ├── order-item-model.ts
│   │   │   ├── order-model.ts
│   │   │   ├── panel-model.ts
│   │   │   ├── parameter-model.ts
│   │   │   ├── patient-insurance-model.ts
│   │   │   ├── patient-model.ts
│   │   │   ├── result-model.ts
│   │   │   ├── sample-model.ts
│   │   │   └── user-model.ts
│   │   ├── services/
│   │   │   ├── dashboard-service.ts
│   │   │   ├── doctor-service.spec.ts
│   │   │   ├── doctor-service.ts
│   │   │   ├── exam-service.spec.ts
│   │   │   ├── exam-service.ts
│   │   │   ├── insurance-service.spec.ts
│   │   │   ├── insurance-service.ts
│   │   │   ├── order-service.spec.ts
│   │   │   ├── order-service.ts
│   │   │   ├── panel-service.spec.ts
│   │   │   ├── panel-service.ts
│   │   │   ├── parameter-service.spec.ts
│   │   │   ├── parameter-service.ts
│   │   │   ├── patient-service.spec.ts
│   │   │   ├── patient-service.ts
│   │   │   ├── result-service.spec.ts
│   │   │   ├── result-service.ts
│   │   │   ├── sample-service.spec.ts
│   │   │   ├── sample-service.ts
│   │   │   ├── user-profile-service.spec.ts
│   │   │   ├── user-profile-service.ts
│   │   │   ├── user-service.spec.ts
│   │   │   └── user-service.ts
│   │   ├── app.config.ts
│   │   ├── app.css
│   │   ├── app.html
│   │   ├── app.routes.ts
│   │   ├── app.spec.ts
│   │   └── app.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── .editorconfig
├── .gitignore
├── .postcssrc.json
├── README.md
├── angular.json
├── package-lock.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
```

> Note: `node_modules/` contains external dependencies installed via npm and is not expanded to keep the document manageable.

Models, services and Components
- Models (e.g., `patient-model.ts`, `order-model.ts`) define strong typing so templates and services remain type-safe.
- Services encapsulate HTTP calls, caching, and mapping logic. `PatientsService` merges `/pacientes`, `/patientinsurances`, and insurance catalogs, exposes BehaviorSubjects, and synchronizes logical deletes.
- Components use standalone configurations (`@Component({ standalone: true })`), PrimeNG data tables, and route guards. Key flows include landing/login pages, dashboards, CRUD forms (create/update patient, order, sample, exam), and operational trackers (sample tracking, upcoming results modules).

### 6.2 Visual explanation of the system’s operation

```txt
┌────────────┐
│ User Event │  (click, submit, navigation)
└─────┬──────┘
      │ triggers component handler
      ▼
┌─────────────────────────────┐
│ Angular Component (PrimeNG) │
│ • reacts to forms & guards  │
│ • reads BehaviorSubjects    │
└─────┬───────────┬───────────┘
      │ async call │ update UI optimistically
      ▼            │
┌──────────────────────────────┐
│ RxJS Service + HttpClient    │
│ • authInterceptor injects JWT│
│ • forkJoin/map compose data  │
│ • catchError -> toast/modal  │
└─────┬────────────────────────┘
      │ REST/JSON over HTTPS
      ▼
┌──────────────────────────────┐
│ Express API (Node/TypeScript)│
│ • routes + controllers       │
│ • RBAC + validation          │
│ • Sequelize models           │
└─────┬────────────────────────┘
      │ SQL via ORM
      ▼
┌──────────────────────────────┐
│ Relational Database          │
│ • orders, samples, results   │
│ • auth tables                │
└─────┬────────────────────────┘
      │ persisted entities
      ▼
┌──────────────────────────────┐
│ Response DTO                 │
│ • controllers shape payloads │
└─────┬────────────────────────┘
      │ Observable next()
      ▼
┌──────────────────────────────┐
│ Service BehaviorSubject      │
│ • merge/update caches        │
│ • emit to subscribers        │
└─────┬────────────────────────┘
      │ async pipe in templates
      ▼
┌──────────────────────────────┐
│ Component + PrimeNG widgets  │
│ • tables/cards refresh       │
│ • toasts/dialogs show result │
└──────────────────────────────┘
```

## 7. Frontend–Backend Integration
- **Base URLs & environments:** All Angular services import a single `API_URL` token defined in `src/environments` (or a constant inside `app.config`). Switching from local to staging/production only requires overriding that constant, which keeps every `HttpClient` call aligned with the Express gateway (`http://localhost:4000/api` by default). Additional headers such as `Accept-Language` are attached in one place to avoid duplication.

- **Authentication flow:** The `authInterceptor` reads the current session from `SessionService`. When a JWT exists, it appends `Authorization: Bearer <token>` to the request. If the backend responds with 401/403, the interceptor invalidates the session, triggers `AuthService.refreshToken()` if a refresh token is available, and retries the request transparently. Otherwise, it redirects the user to `/auth/login`.

- **Route protection & state:** `AuthGuard` checks `SessionService.isLoggedIn()` before allowing navigation. If the user is not authenticated, it redirects to the login page while storing the attempted URL for post-login redirection. The guard also checks role-based scopes so routes like `/administracion/pacientes` remain restricted to ADMIN/STAFF personas exposed by backend RBAC metadata.

- **Service composition & caching:** Each feature service coordinates multiple REST endpoints. For example:

```ts
// patients-service.ts
load(): Observable<PatientViewModel[]> {
  return forkJoin([
    this.http.get<Patient[]>(`${API_URL}/pacientes`),
    this.http.get<PatientInsurance[]>(`${API_URL}/patientinsurances`)
  ]).pipe(
    map(([patients, insurances]) => this.mergeCoverage(patients, insurances)),
    tap(viewModels => this.store.next(viewModels))
  );
}
```

This pattern keeps the UI reactive through `BehaviorSubject`s while minimizing duplicate HTTP calls. Similar logic exists in `OrdersService` (orders + samples + results) and `DashboardService` (KPIs from multiple endpoints).

- **Error handling & observability:** Every service pipes the request through `catchError`, translating backend error structures (validation, business rules, 500s) into PrimeNG toasts or modal dialogs. The backend meanwhile logs structured JSON via `morgan` and custom middleware, so reproducing frontend errors is straightforward.

- **Serialization & DTO parity:** TypeScript interfaces under `src/app/models` mirror Sequelize models (e.g., `doctor-model.ts`, `order-model.ts`). This ensures compile-time safety and avoids runtime shape mismatches. When backend responses include nested resources (orders with `orderItems`), the same interface is reused across the Angular layer and the Express controller response DTO, keeping transformations minimal.

- **Real-time/async concerns:** Although HTTP/REST is the primary integration, modules such as sample tracking periodically poll `/api/muestras?state=EN_PROCESO` using RxJS timers to approximate real-time updates, while future WebSocket integration is encapsulated behind a `NotificationsService` so migration requires minimal changes.

## 8. Conclusions & Recommendations
- The current layering keeps responsibilities separated (UI, API, persistence). Keep controllers slim by factoring repetitive validation into middleware or service helpers.
- Ensure `.env` files define `DB_ENGINE`, DB credentials, and `JWT_SECRET` before running `npm run dev`; add `.example` templates for onboarding.
- Create database migrations or seed scripts (Sequelize CLI) so deployments can recreate the schema without relying solely on `sync`.
- Expand automated tests: backend unit tests for controllers/services and frontend component/service specs around PatientsService caching/merge logic.
- Introduce monitoring (winston logging, health-check route, Docker compose) to streamline future deployments and observability.
