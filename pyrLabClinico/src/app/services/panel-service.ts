// src/app/services/panel-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, tap, take } from 'rxjs/operators';

import { PanelI, PanelItemI, PanelState } from '../models/panel-model';
import { ExamI } from '../models/exam-model';
import { ParameterI } from '../models/parameter-model';
import { ExamsService } from './exam-service';
import { ParameterService } from './parameter-service';

export interface PanelListParams {
  q?: string;
  state?: PanelState;
}

interface PanelListResponse { panels?: PanelApi[]; }
interface PanelItemsResponse { panelItems?: PanelItemApi[]; }

interface PanelApi extends Omit<PanelI, 'items'> {
  items?: PanelItemApi[];
}

interface PanelItemApi extends PanelItemI {
  panelId?: number;
}

@Injectable({ providedIn: 'root' })
export class PanelsService {
  private http = inject(HttpClient);
  private examsSvc = inject(ExamsService);
  private paramsSvc = inject(ParameterService);
  private readonly baseUrl = 'http://localhost:4000/api';

  private readonly _items$ = new BehaviorSubject<PanelI[]>([]);
  readonly items$ = this._items$.asObservable();

  private loaded = false;
  private loading$?: Observable<PanelI[]>;

  list(params?: PanelListParams, options?: { force?: boolean }): Observable<PanelI[]> {
    return this.ensureLoaded(options?.force).pipe(
      switchMap(list => of(this.applyFilters(list, params)))
    );
  }

  refresh(): Observable<PanelI[]> {
    return this.ensureLoaded(true);
  }

  getById(id: number): Observable<PanelI | undefined> {
    return this.reloadPanel(id);
  }

  add(row: Omit<PanelI, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): Observable<PanelI> {
    return this.http.post<PanelApi>(`${this.baseUrl}/panel`, this.mapToApi(row)).pipe(
      switchMap(api => {
        if (!api?.id) return throwError(() => new Error('No se pudo crear el panel.'));
        const newId = api.id as number;
        return this.syncItems(newId, row.items ?? []).pipe(
          switchMap(() => this.reloadPanel(newId)),
          map(panel => {
            if (!panel) throw new Error('No se pudo cargar el panel creado.');
            return panel;
          })
        );
      })
    );
  }

  update(id: number, patch: Partial<PanelI>): Observable<PanelI | undefined> {
    return this.http.patch<PanelApi>(`${this.baseUrl}/panel/${id}`, this.mapToApi(patch)).pipe(
      switchMap(() => {
        if (patch.items) {
          return this.syncItems(id, patch.items).pipe(switchMap(() => this.reloadPanel(id)));
        }
        return this.reloadPanel(id);
      }),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  remove(id: number): Observable<boolean> {
    return this.http.patch(`${this.baseUrl}/panel/${id}/logic`, {}).pipe(
      map(() => true),
      tap(() => this._items$.next(this._items$.value.filter(p => p.id !== id))),
      catchError(err => {
        if (err?.status === 404) return of(false);
        return throwError(() => err);
      })
    );
  }

  private ensureLoaded(force = false): Observable<PanelI[]> {
    if (!force && this.loaded) {
      return of(this._items$.value);
    }

    if (force) {
      this.loading$ = undefined;
      this.loaded = false;
    }

    if (!this.loading$) {
      this.loading$ = this.fetchPanelsWithRefs().pipe(
        tap(list => {
          this._items$.next(list);
          this.loaded = true;
        }),
        finalize(() => { this.loading$ = undefined; }),
        shareReplay(1)
      );
    }

    return this.loading$;
  }

  private fetchPanelsWithRefs(): Observable<PanelI[]> {
    return forkJoin({
      panels: this.http.get<PanelListResponse>(`${this.baseUrl}/paneles`),
      items: this.http.get<PanelItemsResponse>(`${this.baseUrl}/panelitems/public`),
      refs: this.fetchReferenceMaps()
    }).pipe(
      map(({ panels, items, refs }) => {
        const grouped = this.groupItemsByPanel(items.panelItems ?? []);
        return (panels.panels ?? []).map(panel =>
          this.mapFromApi(panel, grouped.get(panel.id ?? 0) ?? [], refs)
        );
      })
    );
  }

  private fetchPanelWithRefs(id: number): Observable<PanelI | undefined> {
    return forkJoin({
      panel: this.http.get<PanelApi>(`${this.baseUrl}/panel/${id}`),
      items: this.http.get<PanelItemsResponse>(`${this.baseUrl}/panelitems/public`),
      refs: this.fetchReferenceMaps()
    }).pipe(
      map(({ panel, items, refs }) => {
        if (!panel) return undefined;
        const related = (items.panelItems ?? []).filter(it => it.panelId === id);
        return this.mapFromApi(panel, related, refs);
      }),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  private reloadPanel(id: number): Observable<PanelI | undefined> {
    return this.fetchPanelWithRefs(id).pipe(
      tap(panel => {
        if (panel) {
          this.upsert(panel);
        } else {
          this._items$.next(this._items$.value.filter(p => p.id !== id));
        }
      })
    );
  }

  private upsert(panel: PanelI): void {
    if (!panel.id) return;
    const copy = [...this._items$.value];
    const idx = copy.findIndex(p => p.id === panel.id);
    if (idx === -1) {
      this._items$.next([panel, ...copy]);
    } else {
      copy[idx] = panel;
      this._items$.next(copy);
    }
  }

  private mapFromApi(api: PanelApi, items: PanelItemApi[], refs: ReferenceMaps): PanelI {
    return {
      ...api,
      items: this.normalizeItems(items, refs)
    };
  }

  private mapToApi(panel: Partial<PanelI>): Partial<PanelApi> {
    const { items, ...rest } = panel;
    return { ...rest };
  }

  private normalizeItems(items: PanelItemApi[], refs: ReferenceMaps): PanelItemI[] {
    return (items ?? []).map((item, index) => {
      const normalized = { ...item } as PanelItemI;
      normalized.order = normalized.order ?? index + 1;
      normalized.required = normalized.required ?? false;

      if (normalized.kind === 'EXAM') {
        normalized.parameterId = null;
        const exam = refs.exams.get(normalized.examId ?? -1);
        normalized.examName = exam?.name ?? exam?.code ?? `Examen #${normalized.examId ?? ''}`;
      }
      if (normalized.kind === 'PARAM') {
        normalized.examId = null;
        normalized.examName = undefined;
        const param = refs.params.get(normalized.parameterId ?? -1);
        normalized.parameterName = param?.name ?? param?.code ?? `Parámetro #${normalized.parameterId ?? ''}`;
      }
      return normalized;
    }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  private normalizeItemForApi(item: PanelItemI, panelId: number, orderFallback: number): PanelItemApi {
    return {
      panelId,
      kind: item.kind,
      required: item.required ?? false,
      order: item.order ?? orderFallback,
      notes: item.notes ?? null,
      examId: item.kind === 'EXAM' ? (item.examId ?? null) : null,
      parameterId: item.kind === 'PARAM' ? (item.parameterId ?? null) : null
    };
  }

  private applyFilters(items: PanelI[], p?: PanelListParams): PanelI[] {
    let out = [...items];
    if (p?.state) out = out.filter(x => x.state === p.state);
    const q = p?.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(x =>
        x.name.toLowerCase().includes(q) ||
        (x.description ?? '').toLowerCase().includes(q)
      );
    }
    return out.sort((a, b) =>
      (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '') || (b.id ?? 0) - (a.id ?? 0)
    );
  }

  private fetchReferenceMaps(): Observable<ReferenceMaps> {
    return forkJoin({
      exams: this.examsSvc.list({ status: 'ACTIVE' }).pipe(take(1)),
      params: this.paramsSvc.list().pipe(take(1))
    }).pipe(
      map(({ exams, params }) => ({
        exams: this.toExamMap(exams),
        params: this.toParamMap(params)
      }))
    );
  }

  private groupItemsByPanel(items: PanelItemApi[]): Map<number, PanelItemApi[]> {
    const grouped = new Map<number, PanelItemApi[]>();
    items.forEach(item => {
      const panelId = item.panelId ?? 0;
      if (!grouped.has(panelId)) grouped.set(panelId, []);
      grouped.get(panelId)!.push(item);
    });
    return grouped;
  }

  private syncItems(panelId: number, items: PanelItemI[]): Observable<void> {
    return this.http.get<PanelItemsResponse>(`${this.baseUrl}/panelitems/public`).pipe(
      map(res => (res.panelItems ?? []).filter(it => it.panelId === panelId)),
      switchMap(existing => {
        const deactivate$ = existing.length
          ? forkJoin(existing.map(it => this.http.patch(`${this.baseUrl}/panelitem/${it.id}/logic/public`, {}))).pipe(map(() => void 0))
          : of(void 0);

        const normalized = (items ?? []).map((item, idx) =>
          this.normalizeItemForApi(item, panelId, idx + 1)
        );

        return deactivate$.pipe(
          switchMap(() => {
            if (!normalized.length) return of(void 0);
            return forkJoin(normalized.map(it => this.http.post(`${this.baseUrl}/panelitem/public`, it))).pipe(map(() => void 0));
          })
        );
      })
    );
  }

  private toExamMap(exams: ExamI[]): Map<number, ExamI> {
    const map = new Map<number, ExamI>();
    exams.forEach(ex => {
      if (typeof ex.id === 'number') map.set(ex.id, ex);
    });
    return map;
  }

  private toParamMap(params: ParameterI[]): Map<number, ParameterI> {
    const map = new Map<number, ParameterI>();
    params.forEach(param => {
      if (typeof param.id === 'number') map.set(param.id, param);
    });
    return map;
  }
}

interface ReferenceMaps {
  exams: Map<number, ExamI>;
  params: Map<number, ParameterI>;
}
