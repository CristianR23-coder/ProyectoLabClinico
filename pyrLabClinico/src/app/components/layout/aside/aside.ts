import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [PanelMenuModule, RouterModule, TooltipModule, CommonModule],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
})
export class Aside implements OnInit {
  @Input() isAsideOpen = true;
  @Input() collapsed = false;
  @Output() toggleAside = new EventEmitter<void>();
  onToggle() { this.toggleAside.emit(); }

  items: MenuItem[] = [];
  itemsIconOnly: MenuItem[] = [];

  ngOnInit(): void {
    this.items = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        routerLink: ['/home'],
      },
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-line',
        routerLink: ['/dashboard']
      },
      {
        label: 'Órdenes',
        icon: 'pi pi-folder',
        items: [
          { label: 'Buscar / Listar', icon: 'pi pi-search', routerLink: ['/ordenes'] },
          // { label: 'Nueva orden', icon: 'pi pi-plus-circle', routerLink: ['/ordenes/nueva'], routerLinkActiveOptions: { exact: true }},
          { label: 'Orden–Examen', icon: 'pi pi-list-check', routerLink: ['/ordenes/ordenes-examenes'] },
        ],
      },
      {
        label: 'Muestras',
        icon: 'pi pi-inbox',
        items: [
          { label: 'Buscar / Listar', icon: 'pi pi-search', routerLink: ['/muestras'] },
          // { label: 'Recepción', icon: 'pi pi-download', routerLink: ['/muestras/recepcion'] },
          { label: 'Seguimiento / estado', icon: 'pi pi-truck', routerLink: ['/muestras/seguimiento'] },
        ],
      },
      {
        label: 'Resultados',
        icon: 'pi pi-chart-line',
        items: [
          { label: 'Ingreso por parámetro', icon: 'pi pi-sliders-h', routerLink: ['/resultados'] },
          { label: 'Entrega / impresión', icon: 'pi pi-print', routerLink: ['/resultados/entrega'] },
        ],
      },
      // {
      //   label: 'Reportes',
      //   icon: 'pi pi-file',
      //   items: [
      //     { label: 'Informe por orden', icon: 'pi pi-file', routerLink: ['/reportes/orden'] },
      //     { label: 'Consolidado', icon: 'pi pi-chart-bar', routerLink: ['/reportes/consolidado'] },
      //     { label: 'Productividad', icon: 'pi pi-chart-pie', routerLink: ['/reportes/productividad'] },
      //   ],
      // },
      // {
      //   label: 'Caja / Pagos',
      //   icon: 'pi pi-wallet',
      //   items: [
      //     { label: 'Registrar pago', icon: 'pi pi-dollar', routerLink: ['/caja/pago'] },
      //     { label: 'Historial', icon: 'pi pi-history', routerLink: ['/caja/historial'] },
      //     { label: 'Facturación', icon: 'pi pi-credit-card', routerLink: ['/caja/facturacion'] },
      //   ],
      // },
      {
        label: 'Configuración',
        icon: 'pi pi-cog',
        items: [
          { label: 'Exámenes', icon: 'pi pi-book', routerLink: ['/configuracion/examenes'] },
          { label: 'Parámetros', icon: 'pi pi-sliders-h', routerLink: ['/configuracion/parametros'] },
          { label: 'Paneles', icon: 'pi pi-th-large', routerLink: ['/configuracion/paneles'] },
        ],
      },
      {
        label: 'Administración',
        icon: 'pi pi-shield',
        items: [
          { label: 'Pacientes', icon: 'pi pi-users', routerLink: ['/administracion/pacientes'] },
          { label: 'Doctores', icon: 'pi pi-user', routerLink: ['/administracion/doctores'] },
          { label: 'Aseguradoras', icon: 'pi pi-briefcase', routerLink: ['/administracion/aseguradoras'] },
          // { label: 'Usuarios / Roles', icon: 'pi pi-lock', routerLink: ['/administracion/usuarios'] },
          { label: 'Repositorio', icon: 'pi pi-github', routerLink: ['/administracion/repositorio'] },
        ],
      },
    ];

    // Variante colapsada (solo iconos + tooltip con label)
    this.itemsIconOnly = [
      { icon: 'pi pi-folder',      routerLink: ['/ordenes'],        tooltip: 'Órdenes' },
      { icon: 'pi pi-inbox',       routerLink: ['/muestras'],       tooltip: 'Muestras' },
      { icon: 'pi pi-chart-line',  routerLink: ['/resultados'],     tooltip: 'Resultados' },
      { icon: 'pi pi-file',        routerLink: ['/reportes'],       tooltip: 'Reportes' },
      // { icon: 'pi pi-wallet',      routerLink: ['/caja'],           tooltip: 'Caja / Pagos', },
      { icon: 'pi pi-cog',         routerLink: ['/configuracion'],  tooltip: 'Configuración' },
      { icon: 'pi pi-shield',      routerLink: ['/admin'],          tooltip: 'Administración', },
    ] as MenuItem[];
  }
}
