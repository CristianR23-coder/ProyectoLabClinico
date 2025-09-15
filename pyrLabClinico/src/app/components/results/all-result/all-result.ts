import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

import { ResultsService } from '../../../services/result-service';
import { ResultI, ResultState } from '../../../models/result-model';
import { ValidatedResult } from '../validated-result/validated-result';
import { UpdateResult } from '../../../components/results/update-result/update-result';  // ajusta ruta si difiere
import { ViewResult } from '../../../components/results/view-result/view-result';        // ajusta ruta si difiere
import { CreateResult } from '../../../components/results/create-result/create-result';  // 👈 NUEVO (ajusta ruta si difiere)

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    TableModule, InputTextModule, ButtonModule, TagModule, DialogModule, SelectModule,
    UpdateResult, ViewResult, CreateResult, ValidatedResult
  ],
  templateUrl: './all-result.html'
})
export class AllResult implements OnInit, OnChanges {
  @Input() orderId?: number | null;
  @Input() sampleId?: number | null;
  @Input() examId?: number | null;
  @Input() parameterId?: number | null;

  private fb = inject(FormBuilder);
  private svc = inject(ResultsService);

  private ctx$ = new BehaviorSubject<{ orderId?: number|null; sampleId?: number|null; examId?: number|null; parameterId?: number|null; }>({});

  form = this.fb.group({
    q: this.fb.control<string>(''),
    state: this.fb.control<ResultState | undefined>(undefined)
  });

  rows$: Observable<ResultI[]> = combineLatest([
    this.ctx$.asObservable(),
    this.form.valueChanges.pipe(startWith(this.form.getRawValue()))
  ]).pipe(
    switchMap(([ctx, v]) => this.svc.list({
      q: v.q || undefined,
      state: v.state || undefined,
      orderId: ctx.orderId ?? undefined,
      sampleId: ctx.sampleId ?? undefined,
      examId: ctx.examId ?? undefined,
      parameterId: ctx.parameterId ?? undefined
    }))
  );

  // Editar
  showEdit = false;
  selectedId?: number;
  openEdit(id: number) { this.selectedId = id; this.showEdit = true; }
  closeEdit() { this.showEdit = false; this.selectedId = undefined; }

  // Ver
  showView = false;
  openView(id: number) { this.selectedId = id; this.showView = true; }
  closeView() { this.showView = false; this.selectedId = undefined; }

  // Crear
  showCreate = false;
  openCreate() { this.showCreate = true; }
  closeCreate() { this.showCreate = false; }

  // ✅ Validar
  showValidate = false;
  openValidate(id: number) { this.selectedId = id; this.showValidate = true; }
  closeValidate() { this.showValidate = false; this.selectedId = undefined; }

  ngOnInit(): void {
    this.ctx$.next({ orderId: this.orderId ?? null, sampleId: this.sampleId ?? null, examId: this.examId ?? null, parameterId: this.parameterId ?? null });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderId'] || changes['sampleId'] || changes['examId'] || changes['parameterId']) {
      this.ctx$.next({ orderId: this.orderId ?? null, sampleId: this.sampleId ?? null, examId: this.examId ?? null, parameterId: this.parameterId ?? null });
    }
  }

  clear(): void { this.form.reset({ q: '', state: undefined }); }

  tagSeverity(s?: ResultState): 'warn' | 'info' | 'success' | 'danger' | undefined {
    switch (s) {
      case 'PENDIENTE': return 'warn';
      case 'VALIDADO':  return 'success';
      case 'RECHAZADO': return 'danger';
      default: return undefined;
    }
  }

  onDelete(id: number) {
    const ok = confirm(`¿Eliminar resultado #${id}?`);
    if (!ok) return;
    this.svc.remove(id).subscribe();
  }
}
