// src/app/services/user-service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface UserI {
  id: number;
  username: string;
  password?: string;                 // solo mock
  role: 'PATIENT'|'DOCTOR'|'ADMIN'|'STAFF';
  status: 'ACTIVE'|'INACTIVE';
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly _items$ = new BehaviorSubject<UserI[]>([
    { id: 1, username: 'admin', password: 'admin', role: 'ADMIN', status: 'ACTIVE' }
  ]);
  readonly items$ = this._items$.asObservable();

  list(): Observable<UserI[]> { return this.items$.pipe(delay(80)); }
  getById(id: number): Observable<UserI|undefined> {
    return this.items$.pipe(map(xs => xs.find(u => u.id === id)));
  }
  findByUsername(username: string): Observable<UserI|undefined> {
    const u = username.trim().toLowerCase();
    return this.items$.pipe(map(xs => xs.find(x => x.username.toLowerCase() === u)));
  }

  // ── Auto helpers ──────────────────────────────────────────────
  private generateId(): number {
    const ids = this._items$.value.map(x => x.id ?? 0);
    const max = ids.length ? Math.max(...ids) : 0;
    return max + 1;
  }

  private normalizeBase(s: string): string {
    return s
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
      .replace(/[^a-zA-Z0-9 ]+/g, ' ')                  // limpia raros
      .toLowerCase().replace(/\s+/g, '');               // junta sin espacios
  }

  private ensureUniqueUsername(base: string): string {
    const taken = new Set(this._items$.value.map(u => u.username.toLowerCase()));
    if (!taken.has(base)) return base;
    // agrega sufijo incremental: juanperez, juanperez1, juanperez2,...
    let i = 1;
    while (taken.has(`${base}${i}`)) i++;
    return `${base}${i}`;
  }

  /** Crea usuario para paciente: username = nombre+apellido, pass = docNumber */
  createForPatient(p: { firstName?: string; lastName?: string; docNumber: string; status: 'ACTIVE'|'INACTIVE' }): UserI {
    const base = this.normalizeBase(`${p.firstName ?? ''}${p.lastName ?? ''}` || 'paciente');
    const username = this.ensureUniqueUsername(base || 'paciente');
    const user: UserI = {
      id: this.generateId(),
      username,
      password: p.docNumber,
      role: 'PATIENT',
      status: p.status
    };
    this._items$.next([user, ...this._items$.value]);
    return user;
  }

  /** Crea usuario para doctor: toma primer y último token del name */
  createForDoctor(d: { name: string; docNumber: string; status: 'ACTIVE'|'INACTIVE' }): UserI {
    const parts = (d.name || '').trim().split(/\s+/);
    const first = parts[0] ?? '';
    const last  = parts.length > 1 ? parts[parts.length - 1] : '';
    const base = this.normalizeBase(`${first}${last}` || 'doctor');
    const username = this.ensureUniqueUsername(base || 'doctor');
    const user: UserI = {
      id: this.generateId(),
      username,
      password: d.docNumber,
      role: 'DOCTOR',
      status: d.status
    };
    this._items$.next([user, ...this._items$.value]);
    return user;
  }

  /** Opcional: actualizar password si cambia docNumber */
  updatePassword(id: number, newPass: string) {
    const arr = this._items$.value;
    const idx = arr.findIndex(u => u.id === id);
    if (idx === -1) return;
    const copy = [...arr];
    copy[idx] = { ...copy[idx], password: newPass };
    this._items$.next(copy);
  }

  /** Opcional: marcar INACTIVE si borras perfil */
  setStatus(id: number, status: 'ACTIVE'|'INACTIVE') {
    const arr = this._items$.value;
    const idx = arr.findIndex(u => u.id === id);
    if (idx === -1) return;
    const copy = [...arr];
    copy[idx] = { ...copy[idx], status };
    this._items$.next(copy);
  }
}
