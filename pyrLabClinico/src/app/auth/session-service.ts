// src/app/auth/session.service.ts
import { Injectable } from '@angular/core';
import { AuthenticatedUser, LoginResponse } from '../models/user-model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  // ──────────────── Getters ────────────────
  get token(): string | null {
    return localStorage.getItem('auth_token') ?? localStorage.getItem('token');
  }

  get refreshToken(): string | null {
    return localStorage.getItem('refreshToken');
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

  get currentUser(): AuthenticatedUser | null {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthenticatedUser;
    } catch {
      return null;
    }
  }

  get isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  // ──────────────── Métodos ────────────────
  /** Guarda la sesión cuando el login es exitoso */
  setSession(response: LoginResponse) {
    const { token, refreshToken, user } = response;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUserId', String(user.id));
    localStorage.setItem('currentUserRole', user.role);
    localStorage.setItem('currentUsername', user.username);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /** Limpia todo (logout) */
  clear() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserRole');
    localStorage.removeItem('currentUsername');
    localStorage.removeItem('currentUser');
  }
}
