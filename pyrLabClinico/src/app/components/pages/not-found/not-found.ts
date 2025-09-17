import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './not-found.html'
})
export class NotFound {
  private router = inject(Router);
  private location = inject(Location);

  url = this.router.url;

  goHome() {
    this.router.navigateByUrl('/');
  }

  goBack() {
    if (history.length > 1) this.location.back();
    else this.goHome();
  }
}
