// components/panels/all-panel/all-panel.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { combineLatest, startWith, switchMap } from 'rxjs';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { PanelsService } from '../../../services/panel-service';
import { PanelI, PanelState } from '../../../models/panel-model';
import { CreatePanel } from '../create-panel/create-panel';
import { UpdatePanel } from '../update-panel/update-panel';
import { ViewPanel } from '../view-panel/view-panel';

@Component({
  selector: 'app-panels-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    TableModule, InputTextModule, ButtonModule, DialogModule, SelectModule, TagModule,
    CreatePanel, UpdatePanel, ViewPanel
  ],
  templateUrl: './all-panels.html'
})
export class AllPanel implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PanelsService);

  form = this.fb.group({
    q: this.fb.control<string>(''),
    state: this.fb.control<PanelState | undefined>(undefined)
  });

  rows$ = combineLatest([
    this.form.valueChanges.pipe(startWith(this.form.getRawValue()))
  ]).pipe(
    switchMap(([v]) => this.svc.list({ q: v.q || undefined, state: v.state || undefined }))
  );

  // Diálogos
  showCreate = false;
  openCreate() { this.showCreate = true; }
  closeCreate() { this.showCreate = false; }

  showEdit = false;
  selectedId?: number;
  openEdit(id: number) { this.selectedId = id; this.showEdit = true; }
  closeEdit() { this.showEdit = false; this.selectedId = undefined; }

  showView = false;
  openView(id: number) { this.selectedId = id; this.showView = true; }
  closeView() { this.showView = false; this.selectedId = undefined; }

  ngOnInit(): void { /* nada especial */ }

  clear() { this.form.reset({ q: '', state: undefined }); }

  tagSeverity(s: PanelState | undefined) {
    return s === 'ACTIVO' ? 'success' : s === 'INACTIVO' ? 'warn' : undefined;
  }

  onDelete(id: number) {
    const ok = confirm(`¿Eliminar panel #${id}?`);
    if (!ok) return;
    this.svc.remove(id).subscribe();
  }
}
