import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { AllOrder } from './components/orders/all-order/all-order';
import { CreateOrder } from './components/orders/create-order/create-order';
import { UpdateOrder } from './components/orders/update-order/update-order';
import { AllSample } from './components/samples/all-sample/all-sample';
import { CreateSample } from './components/samples/create-sample/create-sample';
import { AllResult } from './components/results/all-result/all-result';
import { CreateResult } from './components/results/create-result/create-result';
import { AllExams } from './components/exams/all-exams/all-exams';
import { AllOrIt } from './components/order-items/all-orit/all-orit';
import { AllInsurances } from './components/insurances/all-insurances/all-insurances';
import { AllDoctors } from './components/doctors/all-doctors/all-doctors';
import { AllPatients } from './components/patients/all-patients/all-patients';
import { TrackSamples } from './components/samples/track-samples/track-samples';
import { AllParameters } from './components/parameters/all-parameters/all-parameters';
import { AllPanel } from './components/panel/all-panels/all-panels';
import { RepositoryPage } from './components/pages/repository/repository';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { NotFound } from './components/pages/not-found/not-found';
import { SoonPage } from './components/pages/soon-page/soon-page';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'dashboard',
        component: Dashboard
    },
    {
        path: 'ordenes',
        component: AllOrder
    },
    {
        path: 'ordenes/nueva',
        component: CreateOrder
    },
    {
        path: 'ordenes/:id/editar',
        component: UpdateOrder
    },
    {
        path: 'ordenes/ordenes-examenes',
        component: AllOrIt
    },
    {
        path: 'muestras',
        component: AllSample
    },
    {
        path: 'muestras/nueva',
        component: CreateSample
    },
    {
        path: 'muestras/seguimiento',
        component: TrackSamples
    },
    {
        path: 'resultados',
        component: AllResult
    },
    {
        path: 'resultados/nuevo',
        component: CreateResult
    },
    {
        path: 'resultados/entrega',
        component: SoonPage,
        data: {
            title: 'Entrega / impresión de resultados',
            subtitle: 'Previsualiza, genera y entrega reportes de laboratorio.',
            icon: 'pi pi-print',
            notice: 'Esta página no está operativa todavía.',
            eta: 'Próximamente',
            features: [
                'Búsqueda por paciente, orden o rango de fechas',
                'Previsualización PDF del informe',
                'Descarga e impresión directa',
                'Envío por correo al paciente/médico',
                'Historial de entregas y reimpresiones',
                'Firmas digitales y código QR en el reporte'
            ],
        }
    },
    {
        path: 'configuracion/examenes',
        component: AllExams
    },
    {
        path: 'configuracion/parametros',
        component: AllParameters
    },
    {
        path: 'configuracion/paneles',
        component: AllPanel
    },
    {
        path: 'administracion/aseguradoras',
        component: AllInsurances
    },
    {
        path: 'administracion/doctores',
        component: AllDoctors
    },
    {
        path: 'administracion/pacientes',
        component: AllPatients
    },
    {
        path: 'administracion/repositorio',
        component: RepositoryPage
    },
    {
        path: '**',
        component: NotFound
    },
];