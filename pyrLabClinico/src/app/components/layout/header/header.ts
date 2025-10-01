import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { RouterModule } from '@angular/router';
import { SessionService } from '../../../auth/session-service';
import { Profile } from '../../pages/profile/profile';
import { Observable } from 'rxjs';
import { UserProfileService } from '../../../services/user-profile-service';

export interface PendingResult {
  orderCode: string;
  patient: string;
  exam?: string;
  since?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, TooltipModule, PopoverModule, RouterModule, Profile],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  private session = inject(SessionService);
  private userProfile = inject(UserProfileService);

  @Input() pending: PendingResult[] = [];
  @Input() darkMode = false;

  @Output() darkModeChange = new EventEmitter<boolean>();
  @Output() logout = new EventEmitter<void>();

  pendingCount() { return this.pending?.length ?? 0; }

  toggleDark() {
    this.darkMode = !this.darkMode;
    this.darkModeChange.emit(this.darkMode);
  }
  doLogout() {
    this.session.clear();
    this.logout.emit();
  }

  // Getters para mostrar datos
  get username(): string {
    return this.session.currentUsername || 'Usuario';
  }

  get role(): string {
    return this.session.currentUserRole || 'ROL';
  }

  // 👇 Necesarias para tu template (usar con | async)
  name$: Observable<string> = this.userProfile.displayName$();
  role$: Observable<string> = this.userProfile.displayRole$();

  profileVisible = false;
  openProfile(pop: any) { if (pop?.hide) pop.hide(); this.profileVisible = true; }
}
