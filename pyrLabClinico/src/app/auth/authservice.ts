// src/app/auth/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
// import { HttpClient } from '@angular/common/http'; // <- lo usarás luego

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  // private http = inject(HttpClient); // <- cuando conectes backend
  private _authed$ = new BehaviorSubject<boolean>(localStorage.getItem('DEMO_AUTH') === '1');
  authed$ = this._authed$.asObservable();

  get authed() { return this._authed$.value; }
  get token()  { return localStorage.getItem('DEMO_TOKEN'); }

  // SIMULADO HOY
  async login(username: string, password: string) {
    if (!username || !password) return false;
    localStorage.setItem('DEMO_AUTH', '1');
    // localStorage.setItem('DEMO_TOKEN', 'fake-jwt'); // si quieres simular token
    this._authed$.next(true);
    return true;
  }

  // MAÑANA (API real)
  // login(username: string, password: string) {
  //   return this.http.post<{token:string}>('/api/auth/login', { username, password })
  //     .pipe(tap(res => {
  //        localStorage.setItem('DEMO_TOKEN', res.token);
  //        localStorage.setItem('DEMO_AUTH', '1');
  //        this._authed$.next(true);
  //     }));
  // }

  logout() {
    localStorage.removeItem('DEMO_AUTH');
    localStorage.removeItem('DEMO_TOKEN');
    this._authed$.next(false);
    this.router.navigateByUrl('/login');
  }
}
