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
import { ValidatedResult } from './components/results/validated-result/validated-result';
import { AllPanel } from './components/panel/all-panels/all-panels';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'ordenes',
        component: AllOrder
    },
    {
        path:'ordenes/nueva',
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
        path: 'resultados/validar',
        component: ValidatedResult
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
    }
];