import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { AllOrder } from './components/orders/all-order/all-order';
import { CreateOrder } from './components/orders/create-order/create-order';
import { AllSample } from './components/samples/all-sample/all-sample';
import { CreateSample } from './components/samples/create-sample/create-sample';
import { AllResult } from './components/results/all-result/all-result';
import { CreateResult } from './components/results/create-result/create-result';

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
        path: 'muestras',
        component: AllSample
    },
    {
        path: 'muestras/nueva',
        component: CreateSample
    },
    {
        path: 'resultados',
        component: AllResult
    },
    {
        path: 'resultados/nuevo',
        component: CreateResult
    }
];