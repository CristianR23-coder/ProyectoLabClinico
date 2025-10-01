// src/app/auth/session.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {
  // ──────────────── Getters ────────────────
  get token(): string | null {
    return localStorage.getItem('token');
  }

  get currentUserId(): number | null {
    const v = localStorage.getItem('currentUserId');
    return v ? Number(v) : null;
  }

  get currentUserRole(): 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'STAFF' | null {
    return (localStorage.getItem('currentUserRole') as any) ?? null;
  }

  get currentUsername(): string | null {
    return localStorage.getItem('currentUsername');
  }

  get isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  // ──────────────── Métodos ────────────────
  /** Guarda la sesión cuando el login es exitoso */
  setSession(token: string | null, user: { id: number; role: string; username: string }) {
    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUserId', String(user.id));
    localStorage.setItem('currentUserRole', user.role);
    localStorage.setItem('currentUsername', user.username);
  }

  /** Limpia todo (logout) */
  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserRole');
    localStorage.removeItem('currentUsername');
  }
}
