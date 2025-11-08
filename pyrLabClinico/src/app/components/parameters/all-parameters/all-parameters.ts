// src/app/parameters/all-parameters/all-parameters.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

// ⛏️ rutas corregidas
import { ParameterService } from '../../../services/parameter-service';
import { ParameterI } from '../../../models/parameter-model';

import { CreateParameter } from '../create-parameter/create-parameter';
import { UpdateParameter } from '../update-parameter/update-parameter';

@Component({
  selector: 'app-parameters-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableModule, InputTextModule, ButtonModule, DialogModule, TagModule,
    CreateParameter, UpdateParameter
  ],
  templateUrl: './all-parameters.html'
})
export class AllParameters implements OnInit, OnChanges {
  // 👉 opcional: si no viene, mostramos todos
  @Input() examenId: number | null | undefined;

  private fb = inject(FormBuilder);
  private svc = inject(ParameterService);

  private examenId$ = new BehaviorSubject<number | null>(null);

  form = this.fb.group({
    q: this.fb.control<string>('')
  });

  // ⚠️ No inicializar aquí para no leer @Input en field initializer
  rows$!: Observable<ParameterI[]>;

  ngOnInit(): void {
    this.examenId$.next(this.examenId ?? null);

    this.rows$ = combineLatest([
      this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
      this.examenId$.pipe(startWith(this.examenId ?? null))
    ]).pipe(
      switchMap(([v, id]) =>
        this.svc.list({
          q: v?.q || undefined,
          examenId: id != null ? Number(id) : undefined
        }).pipe(
          map(out => [...out].sort((a, b) =>
            (a.visualOrder ?? 0) - (b.visualOrder ?? 0) ||
            (a.id ?? 0) - (b.id ?? 0)
          ))
        )
      )
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['examenId']) {
      this.examenId$.next(this.examenId ?? null); // re-filtra al cambiar el @Input
    }
  }

  clearFilters(): void {
    this.form.reset({ q: '' });
  }

  // diálogos
  showCreate = false;
  showEdit = false;
  selectedParamId?: number;

  openCreate() { this.showCreate = true; }
  onCreated()  { this.showCreate = false; }

  openEdit(id: number) { this.selectedParamId = id; this.showEdit = true; }
  onSaved() { this.showEdit = false; this.selectedParamId = undefined; }

  onDelete(id: number) {
    const ok = confirm('¿Eliminar parámetro?');
    if (!ok) return;
    this.svc.remove(id).subscribe();
  }
}
