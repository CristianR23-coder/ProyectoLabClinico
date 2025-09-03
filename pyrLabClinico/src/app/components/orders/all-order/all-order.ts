import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

/* PrimeNG */
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';

/* Componentes de detalle y edición */
import { ViewOrder, OrderDetail } from '../view-order/view-order'; // 👉 ajusta ruta si difiere
import { UpdateOrder, OrderForEdit, OrderUpdatePayload } from '../update-order/update-order'; // 👉 ajusta ruta si difiere

/* ================= Tipos ================= */
export type OrderStatus =
  'pendiente' | 'en-proceso' | 'completada' | 'reportada' | 'cancelada';

export interface Order {
  id: string;
  numero: string;
  paciente: string;
  medico: string;
  fechaCreacion: string | Date;
  estado: OrderStatus;
  muestras?: number;
  pruebas: number;
  total: number;
}

type TabValue = 'all' | OrderStatus;

/* =============== MOCKS para la tabla =============== */
const MOCK_ORDERS: Order[] = [
  { id: '1', numero: 'ORD-20250902-001', paciente: 'Ana Gómez',    medico: 'Dra. Pérez',    fechaCreacion: '2025-09-01T09:15:00', estado: 'pendiente',  pruebas: 3, total: 120000 },
  { id: '2', numero: 'ORD-20250901-002', paciente: 'Luis Rojas',   medico: 'Dr. Ramírez',   fechaCreacion: '2025-09-01T15:40:00', estado: 'en-proceso', pruebas: 1, total: 45000  },
  { id: '3', numero: 'ORD-20250830-003', paciente: 'María Zapata', medico: 'Dra. Quintero', fechaCreacion: '2025-08-30T11:05:00', estado: 'completada', pruebas: 2, total: 98000  },
];

@Component({
  selector: 'app-all-order',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    TableModule, ButtonModule, InputTextModule, TagModule, TooltipModule, TabsModule,
    ViewOrder, UpdateOrder, // necesarios para renderizar los diálogos
  ],
  templateUrl: './all-order.html',
  styleUrls: ['./all-order.css'],
})
export class AllOrder implements OnInit {
  /* Fuente de datos (mock por defecto). Si luego recibes [orders] desde un padre, se reemplaza. */
  @Input() orders: Order[] = MOCK_ORDERS;

  @Input() currencyCode = 'COP';
  @Input() pageSize = 10;

  /* Eventos por si usas contenedor */
  @Output() addOrder = new EventEmitter<void>();
  @Output() viewOrder = new EventEmitter<Order>();
  @Output() editOrder = new EventEmitter<Order>();
  @Output() deleteOrder = new EventEmitter<Order>();

  @ViewChild('dt') dt!: Table;

  /* --------- Filtros/Búsqueda --------- */
  globalQuery = '';
  globalFields: string[] = ['numero', 'paciente', 'medico', 'estado'];

  estadoTabs: { label: string; value: TabValue; icon: string }[] = [
    { label: 'Todas',       value: 'all',        icon: 'pi pi-list' },
    { label: 'Pendientes',  value: 'pendiente',  icon: 'pi pi-clock' },
    { label: 'En proceso',  value: 'en-proceso', icon: 'pi pi-sync' },
    { label: 'Completadas', value: 'completada', icon: 'pi pi-check' },
    { label: 'Reportadas',  value: 'reportada',  icon: 'pi pi-check-circle' },
  ];
  estadoValue: TabValue = 'all';

  /* --------- Estado del visor (Ver) --------- */
  showView = false;
  selectedDetail: OrderDetail | null = null;

  /* --------- Estado del editor (Editar) --------- */
  showEdit = false;
  orderToEdit: OrderForEdit | null = null;

  /* Catálogo de exámenes (para el diálogo de edición; mock) */
  examCatalog = [
    { id: 'ex-glu', codigo: 'GLU',  nombre: 'Glucosa',          precio: 18000 },
    { id: 'ex-col', codigo: 'COLT', nombre: 'Colesterol Total', precio: 22000 },
    { id: 'ex-hdl', codigo: 'HDL',  nombre: 'Colesterol HDL',   precio: 21000 },
  ];

  ngOnInit(): void {}

  /* --------- Tabs de estado --------- */
  onEstadoChange(val: unknown) {
    const v = String(val) as TabValue;
    this.estadoValue = v;
    if (!this.dt) return;
    this.dt.filter(null, 'estado', 'equals');
    if (v !== 'all') this.dt.filter(v, 'estado', 'equals');
    if (this.globalQuery) this.dt.filterGlobal(this.globalQuery, 'contains');
  }

  getStatusSeverity(status: OrderStatus): 'success' | 'info' | 'warn' | 'danger' {
    switch (status) {
      case 'completada':
      case 'reportada':  return 'success';
      case 'en-proceso': return 'info';
      case 'pendiente':  return 'warn';
      case 'cancelada':  return 'danger';
    }
  }

  clearSearch() {
    this.globalQuery = '';
    if (this.dt) {
      this.dt.clear();
      if (this.estadoValue !== 'all') this.dt.filter(this.estadoValue, 'estado', 'equals');
    }
  }

  /* ================= Acciones ================= */
  onAdd() { this.addOrder.emit(); }

  /* ---- Ver: abre ViewOrder con detalle (mock por ahora) ---- */
  onView(order: Order) {
    this.viewOrder.emit(order); // por si usas contenedor

    this.selectedDetail = {
      id: order.id,
      numero: order.numero,
      paciente: order.paciente,
      medico: order.medico,
      fechaCreacion: order.fechaCreacion,
      estado: order.estado,
      pruebas: order.pruebas,
      total: order.total,
      pacienteDoc: 'CC 1.234.567.890',
      pacienteEdad: 34,
      aseguradora: 'Colseguros',
      observaciones: 'Paciente en ayunas.',
      muestras: [
        { tipo: 'Sangre', codigoBarra: 'ABC123', fechaToma: new Date(), observacion: null }
      ],
      examenes: [
        { examenId: 'ex-glu', codigo: 'GLU',  nombre: 'Glucosa',          precio: 18000, estado: 'listo' },
        { examenId: 'ex-col', codigo: 'COLT', nombre: 'Colesterol Total', precio: 22000, estado: 'en-proceso' },
      ],
      resultados: [
        { examen: 'Glucosa', parametro: 'Valor', resultado: 89, unidad: 'mg/dL', referencia: '70–100', flag: 'N' }
      ],
    };

    this.showView = true;
  }

  /* ---- Editar: abre EditOrderDialog ---- */
  onEdit(order: Order) {
    this.editOrder.emit(order); // por si usas contenedor
    this.orderToEdit = this.mapToOrderForEdit(order);
    this.showEdit = true;
  }

  /* Recibe cambios guardados desde el diálogo de edición */
  onUpdated(payload: OrderUpdatePayload) {
    // En real: PUT /ordenes/:id y recargar
    this.orders = this.orders.map(o =>
      o.id === payload.id
        ? {
            ...o,
            estado: payload.estado,
            total: payload.total,
            pruebas: payload.pruebas,
            fechaCreacion: payload.fechaCreacion,
          }
        : o
    );
    this.showEdit = false;
  }

  /* Eliminar desde el diálogo */
  onRemoveOrder(id: string) {
    // En real: DELETE /ordenes/:id y recargar
    this.orders = this.orders.filter(o => o.id !== id);
    this.showEdit = false;
  }

  onDelete(order: Order) { this.deleteOrder.emit(order); }

  /* ===== Helper: Order -> OrderForEdit ===== */
  private mapToOrderForEdit(o: Order): OrderForEdit {
    return {
      id: o.id,
      numero: o.numero,
      pacienteId: 'PAC-001',          // en real: cargar desde backend
      medicoId: 'MED-001',
      aseguradoraId: null,
      fechaCreacion: new Date(o.fechaCreacion),
      estado: o.estado,
      observaciones: '',
      muestras: [
        {
          tipo: 'Sangre',
          codigoBarra: 'ABC123',
          fechaToma: new Date(),
          observacion: null,
        },
      ],
      examenes: [
        {
          examenId: 'ex-glu',
          examNombre: 'GLU - Glucosa',
          precio: 18000,
          panelId: null,
        },
      ],
    };
  }
}
