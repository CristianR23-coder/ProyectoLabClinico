import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { RouterModule } from '@angular/router';

export interface PendingResult {
  orderCode: string;
  patient: string;
  exam?: string;
  since?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, TooltipModule, PopoverModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  @Input() pending: PendingResult[] = [];
  @Input() darkMode = false;

  @Output() darkModeChange = new EventEmitter<boolean>();
  @Output() logout = new EventEmitter<void>();

  pendingCount() { return this.pending?.length ?? 0; }

  toggleDark() {
    this.darkMode = !this.darkMode;
    this.darkModeChange.emit(this.darkMode);
  }
  doLogout() { this.logout.emit(); }
}
