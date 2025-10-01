import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from './session-service'; // ajusta la ruta si difiere

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private session: SessionService
  ) {}

  canActivate(): boolean {
    if (!this.session.isLoggedIn) {
      this.session.clear();              // por si hay basura en localStorage
      this.router.navigate(['/login']);  // redirige al login
      return false;
    }
    return true;
  }
}
