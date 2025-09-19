import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Header } from './components/layout/header/header';
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

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        // Tomamos SIEMPRE el snapshot actual del router (ya actualizado)
        const deepest = this.getDeepest(this.router.routerState.snapshot.root);
        this.fullPage = !!deepest.data?.['fullPage'];
      });
  }

  private getDeepest(s: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    while (s.firstChild) s = s.firstChild;
    return s;
  }
}
