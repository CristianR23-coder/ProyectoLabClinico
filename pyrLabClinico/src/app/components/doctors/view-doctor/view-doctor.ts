import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

import { DoctorsService } from '../../../services/doctor-service';
import { DoctorI } from '../../../models/doctor-model';

@Component({
  selector: 'app-view-doctor',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, DividerModule, ButtonModule],
  templateUrl: './view-doctor.html'
})
export class ViewDoctor implements OnInit {
  @Input() doctorId?: number;
  @Output() editRequested = new EventEmitter<number>();
  @Output() deleteRequested = new EventEmitter<number>();

  private svc = inject(DoctorsService);

  item?: DoctorI;
  loading = true;

  ngOnInit(): void {
    if (!this.doctorId) { this.loading = false; return; }
    this.svc.getById(this.doctorId).subscribe(doc => { this.item = doc; this.loading = false; });
  }

  severity(s?: 'ACTIVE'|'INACTIVE'): 'success'|'danger'|'secondary'|undefined {
    if (s === 'ACTIVE') return 'success';
    if (s === 'INACTIVE') return 'danger';
    return 'secondary';
  }

  onEdit(): void { if (this.item?.id) this.editRequested.emit(this.item.id); }
  onDelete(): void { if (this.item?.id) this.deleteRequested.emit(this.item.id); }
}
