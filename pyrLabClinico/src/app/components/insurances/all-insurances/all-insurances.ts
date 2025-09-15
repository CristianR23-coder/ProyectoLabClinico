// src/app/components/insurances/all-insurances/all-insurances.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';

import { InsurancesService } from '../../../services/insurance-service'; // ajusta la ruta si difiere
import { InsuranceI } from '../../../models/insurance-model';

// Hijos usados en los diálogos
import { CreateInsurance } from '../create-insurance/create-insurance';
import { UpdateInsurance } from '../update-insurance/update-insurance';
import { ViewInsurance } from '../view-insurance/view-insurance';

type Status = 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-all-insurances',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableModule, InputTextModule, ButtonModule, TagModule, DialogModule,
    CreateInsurance, UpdateInsurance, ViewInsurance
  ],
  templateUrl: './all-insurances.html'
})
export class AllInsurances {
  private fb = inject(FormBuilder);
  private svc = inject(InsurancesService);

  // ── Estado de diálogos / selección ───────────────────────────────────────────
  showCreate = false;
  showEdit = false;
  showView = false;
  selectedId?: number; // para editar
  viewedId?: number;   // para ver

  // ── Filtros ─────────────────────────────────────────────────────────────────
  form = this.fb.group({
    q: this.fb.control<string>(''),
    status: this.fb.control<Status | undefined>(undefined)
  });

  // Data reactiva: cada cambio en el form dispara un list(params)
  readonly rows$ = this.form.valueChanges.pipe(
    startWith(this.form.getRawValue()),
    switchMap(v =>
      this.svc.list({
        q: v?.q || undefined,
        status: (v?.status as Status | undefined) || undefined
      })
    )
  );

  // ── UI helpers ──────────────────────────────────────────────────────────────
  clear(): void {
    this.form.reset({ q: '', status: undefined });
  }

  tagSeverity(s?: Status): 'success' | 'danger' | 'secondary' | undefined {
    if (s === 'ACTIVE') return 'success';
    if (s === 'INACTIVE') return 'danger';
    return 'secondary';
  }

  // ── Abrir / cerrar diálogos ─────────────────────────────────────────────────
  openCreate(): void { this.showCreate = true; }
  closeCreate(): void { this.showCreate = false; }

  onCreated(_created: InsuranceI): void {
    this.showCreate = false;
    // rows$ se refresca solo porque usamos list() por form changes
  }

  openEdit(id: number): void {
    this.selectedId = id;
    this.showEdit = true;
  }
  closeEdit(): void {
    this.showEdit = false;
    this.selectedId = undefined;
  }
  onEdited(_updated: InsuranceI): void {
    this.closeEdit(); // la tabla se actualiza con list()
  }

  openView(id: number): void {
    this.viewedId = id;
    this.showView = true;
  }
  closeView(): void {
    this.showView = false;
    this.viewedId = undefined;
  }

  // Desde el modal de “ver” (app-view-insurance)
  onViewEdit(id: number): void {
    this.closeView();
    this.openEdit(id);
  }

  onViewDelete(id: number): void {
    const ok = confirm(`¿Eliminar la aseguradora #${id}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    this.svc.remove(id).subscribe(() => {
      this.closeView();
      // list() re-evaluará en el próximo tick al cambiar el estado interno del servicio
    });
  }
}
