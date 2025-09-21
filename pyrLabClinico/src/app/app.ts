import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Header, PendingResult } from './components/layout/header/header'; // ← importa la interfaz y el componente
import { Aside } from './components/layout/aside/aside';
import { Content } from './components/layout/content/content';
import { Footer } from './components/layout/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Aside, Content, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isAsideOpen = true;
  fullPage = false;

  // ====== Estado para el Header ======
  darkMode = this.readTheme();   // tema desde localStorage
  pending: PendingResult[] = [   // simulado: tráelo desde tu servicio real
    { orderCode: 'ORD-10234', patient: 'Juan Pérez',  exam: 'Hemograma', since: 'hace 2h' },
    { orderCode: 'ORD-10251', patient: 'María Gómez', exam: 'Glucosa',  since: 'hace 45m' },
  ];

  constructor(private router: Router) {
    // Detecta la ruta más profunda para tu flag fullPage
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const deepest = this.getDeepest(this.router.routerState.snapshot.root);
        this.fullPage = !!deepest.data?.['fullPage'];
      });

    // Aplica el tema al iniciar
    this.applyTheme(this.darkMode);
  }

  // ====== Handlers que consume el Header ======
  handleDarkChange(value: boolean) {
    this.darkMode = value;
    localStorage.setItem('theme', value ? 'dark' : 'light');
    this.applyTheme(value);
  }

  handleLogout() {
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }

  // ====== Helpers ======
  private getDeepest(s: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    while (s.firstChild) s = s.firstChild;
    return s;
  }

  private readTheme(): boolean {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return false; // por defecto claro
  }

  private applyTheme(isDark: boolean) {
    document.documentElement.classList.toggle('dark', isDark);
    // Si usas preset de PrimeNG/PrimeUIX y quieres alternar CSS de tema,
    // aquí podrías cargar/descargar el stylesheet correspondiente.
  }
}
