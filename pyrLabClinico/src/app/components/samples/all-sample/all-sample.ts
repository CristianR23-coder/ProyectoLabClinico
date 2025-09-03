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

/* Componentes de detalle y edición (ajusta rutas/nombres si difieren) */
import { ViewSample, SampleDetail } from '../view-sample/view-sample';
import { UpdateSample, SampleForEdit, SampleUpdatePayload } from '../update-sample/update-sample';

/* ================= Tipos ================= */
export type SampleStatus = 'pendiente' | 'tomada' | 'rechazada' | 'enviada' | 'archivada';

export interface Sample {
  id: string;
  codigoBarra: string | null;
  tipo: string;             // sangre, suero, orina, etc.
  ordenId: string;          // FK de la orden
  fechaToma: string | Date | null;
  estado: SampleStatus;
  observacion?: string | null;
}

type TabValue = 'all' | SampleStatus;

/* =============== MOCKS para la tabla =============== */
const MOCK_SAMPLES: Sample[] = [
  { id: 'm1', codigoBarra: 'BRC-0001', tipo: 'Sangre', ordenId: '1', fechaToma: '2025-09-01T09:40:00', estado: 'pendiente' },
  { id: 'm2', codigoBarra: 'BRC-0002', tipo: 'Suero',  ordenId: '2', fechaToma: '2025-09-01T15:55:00', estado: 'tomada'    },
  { id: 'm3', codigoBarra: 'BRC-0003', tipo: 'Orina',  ordenId: '3', fechaToma: '2025-08-30T10:10:00', estado: 'rechazada' },
];

@Component({
  selector: 'app-all-sample',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    TableModule, ButtonModule, InputTextModule, TagModule, TooltipModule, TabsModule,
    ViewSample, UpdateSample,
  ],
  templateUrl: './all-sample.html',
  styleUrls: ['./all-sample.css'],
})
export class AllSample implements OnInit {
  /** Fuente de datos (mock por defecto). Si luego recibes [samples] desde un padre, se reemplaza. */
  @Input() samples: Sample[] = MOCK_SAMPLES;

  @Input() pageSize = 10;

  /** Eventos si usas un contenedor/host */
  @Output() addSample = new EventEmitter<void>();
  @Output() viewSample = new EventEmitter<Sample>();
  @Output() editSample = new EventEmitter<Sample>();
  @Output() deleteSample = new EventEmitter<Sample>();

  @ViewChild('dt') dt!: Table;

  /* --------- Filtros/Búsqueda --------- */
  globalQuery = '';
  globalFields: string[] = ['codigoBarra', 'tipo', 'ordenId', 'estado'];

  estadoTabs: { label: string; value: TabValue; icon: string }[] = [
    { label: 'Todas',       value: 'all',       icon: 'pi pi-list' },
    { label: 'Pendientes',  value: 'pendiente', icon: 'pi pi-clock' },
    { label: 'Tomadas',     value: 'tomada',    icon: 'pi pi-check' },
    { label: 'Rechazadas',  value: 'rechazada', icon: 'pi pi-times' },
    { label: 'Enviadas',    value: 'enviada',   icon: 'pi pi-send' },
    { label: 'Archivadas',  value: 'archivada', icon: 'pi pi-archive' },
  ];
  estadoValue: TabValue = 'all';

  /* --------- Estado del visor (Ver) --------- */
  showView = false;
  selectedDetail: SampleDetail | null = null;

  /* --------- Estado del editor (Editar) --------- */
  showEdit = false;
  sampleToEdit: SampleForEdit | null = null;

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

  getStatusSeverity(status: SampleStatus): 'success' | 'info' | 'warn' | 'danger' {
    switch (status) {
      case 'tomada':     return 'success';
      case 'enviada':    return 'info';
      case 'pendiente':  return 'warn';
      case 'rechazada':
      case 'archivada':  return 'danger';
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
  onAdd() { this.addSample.emit(); }

  /* ---- Ver: abre ViewSample con detalle (mock por ahora) ---- */
  onView(sample: Sample) {
    this.viewSample.emit(sample); // por si usas contenedor

    this.selectedDetail = {
      id: sample.id,
      codigoBarra: sample.codigoBarra,
      tipo: sample.tipo,
      ordenId: sample.ordenId,
      fechaToma: sample.fechaToma ? new Date(sample.fechaToma) : null,
      estado: sample.estado,
      observacion: sample.observacion ?? null,
      // datos extra de ejemplo:
      paciente: 'Paciente Demo',
      medico: 'Médico Demo',
      ordenNumero: 'ORD-XXXX',
    };

    this.showView = true;
  }

  /* ---- Editar: abre UpdateSample ---- */
  onEdit(sample: Sample) {
    this.editSample.emit(sample);
    this.sampleToEdit = this.mapToSampleForEdit(sample);
    this.showEdit = true;
  }

  /* Recibe cambios guardados desde el diálogo de edición */
  onUpdated(payload: SampleUpdatePayload) {
    // En real: PUT /muestras/:id y recargar
    this.samples = this.samples.map(s =>
      s.id === payload.id
        ? {
            ...s,
            estado: payload.estado,
            codigoBarra: payload.codigoBarra ?? s.codigoBarra,
            tipo: payload.tipo ?? s.tipo,
            fechaToma: payload.fechaToma ?? s.fechaToma,
            observacion: payload.observacion ?? s.observacion,
          }
        : s
    );
    this.showEdit = false;
  }

  /* Eliminar desde el diálogo */
  onRemoveSample(id: string) {
    // En real: DELETE /muestras/:id y recargar
    this.samples = this.samples.filter(s => s.id !== id);
    this.showEdit = false;
  }

  onDelete(sample: Sample) { this.deleteSample.emit(sample); }

  /* ===== Helper: Sample -> SampleForEdit ===== */
  private mapToSampleForEdit(s: Sample): SampleForEdit {
    return {
      id: s.id,
      ordenId: s.ordenId,
      tipo: s.tipo,
      codigoBarra: s.codigoBarra,
      fechaToma: s.fechaToma ? new Date(s.fechaToma) : null,
      estado: s.estado,
      observacion: s.observacion ?? null,
    };
  }
}
