import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-wip',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule],
  templateUrl: './soon-page.html'
})
export class SoonPage implements OnInit {
  // Personalizable por @Input o por route.data
  @Input() title = 'Sección en construcción';
  @Input() subtitle = 'Estamos trabajando para habilitar esta funcionalidad.';
  @Input() icon = 'pi pi-hammer';
  @Input() eta?: string;              // Ej: 'Q4 2025' o 'Pronto'
  @Input() docLink?: string;          // URL externa o ruta interna
  @Input() features: string[] = [];   // Lista de “lo que viene”
  @Input() notice = 'Esta página no está operativa todavía.'; // 👈 Mensaje visible

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  ngOnInit(): void {
    const d = this.route.snapshot.data || {};
    this.applyData(d);
    this.route.data.subscribe(data => this.applyData(data));
  }

  private applyData(d: any) {
    if (!d) return;
    if (d.title) this.title = d.title;
    if (d.subtitle) this.subtitle = d.subtitle;
    if (d.icon) this.icon = d.icon;
    if (d.eta) this.eta = d.eta;
    if (d.docLink) this.docLink = d.docLink;
    if (Array.isArray(d.features)) this.features = d.features;
    if (d.notice) this.notice = d.notice; // permite override desde rutas
  }

  goBack() {
    const state = (history as any).state;
    if (state && state.navigationId > 1) {
      history.back();
    } else {
      this.goHome();
    }
  }

  goHome() { this.router.navigateByUrl('/home'); }

  isExternal(link?: string): boolean {
    return !!link && /^(http|https):\/\//i.test(link);
  }
}
