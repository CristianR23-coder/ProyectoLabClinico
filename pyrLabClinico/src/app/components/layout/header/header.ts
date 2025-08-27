import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, TooltipModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  @Output() openSettings = new EventEmitter<void>();
  @Output() openNotifications = new EventEmitter<void>();
  @Output() openApps = new EventEmitter<void>();

  onSettings() { this.openSettings.emit(); }
  onNotifs() { this.openNotifications.emit(); }
  onApps() { this.openApps.emit(); }
}