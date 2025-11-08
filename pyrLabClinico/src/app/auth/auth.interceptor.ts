// src/app/auth/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './authservice';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken(); // ✅ reemplaza auth.token

  // Añadir cabecera si existe token
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // Manejo de errores global
  return next(req).pipe(
    catchError(error => {
      if (error.status === 401 || error.status === 403) {
        auth.logout(); // ✅ reemplaza forceLogout()
        router.navigate(['/login']); // redirige al login tras error
      }
      return throwError(() => error);
    })
  );
};
