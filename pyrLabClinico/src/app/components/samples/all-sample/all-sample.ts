import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { PaginatorModule } from 'primeng/paginator';
import { PaginatorState } from 'primeng/paginator';

import { SamplesService, PaginatedResult } from '../../../services/sample-service';   // ajusta si difiere
import { SampleI, SampleState } from '../../../models/sample-model';
import { SpecimenType } from '../../../models/exam-model';

// Diálogos
import { CreateSample } from '../create-sample/create-sample';
import { UpdateSample } from '../update-sample/update-sample';
import { ViewSample } from '../view-sample/view-sample';

type Filters = { q?: string; state?: SampleState; type?: SpecimenType };

@Component({
  selector: 'app-all-samples',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableModule, InputTextModule, ButtonModule, TagModule, SelectModule,
    DialogModule, TabsModule, PaginatorModule,
    CreateSample, UpdateSample, FormsModule, ViewSample
  ],
  templateUrl: './all-sample.html'
})
export class AllSample {
  private fb = inject(FormBuilder);
  private svc = inject(SamplesService);

  // diálogos
  showCreate = false;
  showEdit = false;
  selectedId?: number;

  // opciones (usa las que tengas en tu SampleState)
  readonly stateOptions: SampleState[] = ['RECOLECTADA', 'ENVIADA', 'EN_PROCESO', 'RECHAZADA'] as SampleState[];
  readonly typeOptions: SpecimenType[] = ['SANGRE', 'SUERO', 'PLASMA', 'ORINA', 'SALIVA', 'HECES', 'TEJIDO', 'OTRA'] as SpecimenType[];
  readonly rowsPerPageOptions = [5, 10, 20, 50];
  private readonly DEFAULT_PAGE_SIZE = 10;

  // filtros
  form = this.fb.group({
    q: this.fb.control<string>(''),
    state: this.fb.control<SampleState | undefined>(undefined),
    type: this.fb.control<SpecimenType | undefined>(undefined),
  });

  private pagination$ = new BehaviorSubject<{ page: number; pageSize: number }>({
    page: 1,
    pageSize: this.DEFAULT_PAGE_SIZE
  });

  private readonly filters$ = this.form.valueChanges.pipe(
    startWith(this.form.getRawValue()),
    map(v => ({
      q: v?.q || undefined,
      state: v?.state || undefined,
      type: v?.type || undefined
    } as Filters)),
    tap(() => this.resetPage())
  );

  page$: Observable<PaginatedResult<SampleI>> = combineLatest([
    this.filters$,
    this.pagination$
  ]).pipe(
    switchMap(([filter, pagination]) => this.svc.list({
      q: filter.q,
      state: filter.state,
      type: filter.type,
      page: pagination.page,
      pageSize: pagination.pageSize
    })),
    shareReplay(1)
  );

  // Helpers UI
  tagSeverity(s?: SampleState): 'info' | 'warning' | 'success' | 'danger' | 'help' | undefined {
    switch (s) {
      case 'RECOLECTADA': return 'info';
      case 'ENVIADA': return 'help';
      case 'EN_PROCESO': return 'warning';
      case 'RECHAZADA': return 'danger';
      default: return undefined;
    }
  }

  clear() {
    this.form.reset({ q: '', state: undefined, type: undefined });
    this.resetPage(true);
  }

  openCreate() { this.showCreate = true; }
  closeCreate() { this.showCreate = false; }
  onCreated(_: SampleI) { this.closeCreate(); }

  openEdit(id: number) { this.selectedId = id; this.showEdit = true; }
  closeEdit() { this.showEdit = false; this.selectedId = undefined; }
  onEdited(_: SampleI) { this.closeEdit(); }

  onDelete(rowOrId: SampleI | number) {
    const id = typeof rowOrId === 'number' ? rowOrId : rowOrId.id;
    if (!id) return;
    const ok = confirm(`Delete sample #${id}? This cannot be undone.`);
    if (!ok) return;
    this.svc.remove(id).subscribe(() => {
      this.closeView();
    });
  }

  showView = false;
  selectedDetail?: SampleI;

  // --- view dialog
  onView(s: SampleI) {
    this.selectedDetail = s;
    this.showView = true;
  }
  closeView() {
    this.showView = false;
    this.selectedDetail = undefined;
  }

  onPageChange(event: PaginatorState): void {
    const rows = event.rows ?? this.pagination$.value.pageSize;
    const first = event.first ?? 0;
    const basePage = Math.floor(first / rows);
    this.pagination$.next({ page: basePage + 1, pageSize: rows });
  }

  private resetPage(force = false): void {
    const current = this.pagination$.value;
    if (!force && current.page === 1) return;
    this.pagination$.next({ ...current, page: 1 });
  }
}
