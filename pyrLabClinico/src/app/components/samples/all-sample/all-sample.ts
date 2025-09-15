import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest, map, startWith } from 'rxjs';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';

import { SamplesService } from '../../../services/sample-service';   // ajusta si difiere
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
    DialogModule, TabsModule,
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

  // filtros
  form = this.fb.group({
    q: this.fb.control<string>(''),
    state: this.fb.control<SampleState | undefined>(undefined),
    type: this.fb.control<SpecimenType | undefined>(undefined),
  });

  // Fuente de datos: soporta services con `samples$` o `items$`
  private readonly source$: Observable<SampleI[]> = (() => {
    const s = this.svc as any;
    if (s.samples$) return s.samples$ as Observable<SampleI[]>;
    if (s.items$) return s.items$ as Observable<SampleI[]>;
    throw new Error('SamplesService debe exponer `samples$` o `items$` (Observable<SampleI[]>)');
  })();

  private readonly filters$ = this.form.valueChanges.pipe(
    startWith(this.form.getRawValue()),
    map(v => ({
      q: v?.q || undefined,
      state: v?.state || undefined,
      type: v?.type || undefined
    } as Filters))
  );

  readonly rows$ = combineLatest([this.source$, this.filters$]).pipe(
    map(([items, f]) => this.applyFilters(items, f))
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

  clear() { this.form.reset({ q: '', state: undefined, type: undefined }); }

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


  // Filtros
  private applyFilters(items: SampleI[], p: Filters): SampleI[] {
    let out = items;

    if (p.state) out = out.filter(s => s.state === p.state);
    if (p.type) out = out.filter(s => s.type === p.type);

    const q = p.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(s => {
        const idStr = String(s.id ?? '');
        const ordStr = String(s.orderId ?? '');
        const bc = (s.barcode ?? '').toLowerCase();
        const t = (s.type as string | undefined)?.toLowerCase?.() ?? '';
        const st = (s.state as string | undefined)?.toLowerCase?.() ?? '';
        const obs = (s.observations ?? '').toLowerCase();
        return idStr.includes(q) || ordStr.includes(q) || bc.includes(q) || t.includes(q) || st.includes(q) || obs.includes(q);
      });
    }

    // Ordena por drawDate desc y luego id desc
    return [...out].sort((a, b) =>
      (b.drawDate ?? '').localeCompare(a.drawDate ?? '') || (b.id ?? 0) - (a.id ?? 0)
    );
  }
}
