import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { UserI } from '../models/user-model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly INITIAL: UserI[] = [
    { id: 1, username: 'pac-123456', role: 'PATIENT', status: 'ACTIVE', password: '1234' },
    { id: 2, username: 'doc-789012', role: 'DOCTOR',  status: 'ACTIVE', password: '1234' },
    { id: 3, username: 'admin',      role: 'ADMIN',   status: 'ACTIVE', password: 'admin' },
    { id: 4, username: 'camartinezfreefire',      role: 'ADMIN',   status: 'ACTIVE', password: 'Chondre123!!' },
  ];

  private readonly _items$ = new BehaviorSubject<UserI[]>([...this.INITIAL]);
  readonly items$ = this._items$.asObservable();

  list(): Observable<UserI[]> { return this.items$.pipe(delay(50)); }
  getById(id?: number): Observable<UserI | undefined> {
    return this.items$.pipe(map(xs => xs.find(u => u.id === id)), delay(30));
  }
  findByUsername(username: string): Observable<UserI | undefined> {
    return this.items$.pipe(map(xs => xs.find(u => u.username === username)), delay(30));
  }
}
