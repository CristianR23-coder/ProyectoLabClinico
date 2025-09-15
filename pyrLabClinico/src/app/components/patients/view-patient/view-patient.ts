import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

import { PatientsService } from '../../../services/patient-service';
import { PatientI } from '../../../models/patient-model';

@Component({
  selector: 'app-view-patient',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, DividerModule, ButtonModule],
  templateUrl: './view-patient.html'
})
export class ViewPatient implements OnInit {
  @Input() patientId?: number;
  @Output() editRequested = new EventEmitter<number>();
  @Output() deleteRequested = new EventEmitter<number>();

  private svc = inject(PatientsService);
  item?: PatientI;
  loading = true;

  ngOnInit(): void {
    if (!this.patientId) { this.loading = false; return; }
    this.svc.getById(this.patientId).subscribe(p => { this.item = p; this.loading = false; });
  }

  severity(s?: 'ACTIVE'|'INACTIVE'): 'success'|'danger'|'secondary'|undefined {
    if (s === 'ACTIVE') return 'success';
    if (s === 'INACTIVE') return 'danger';
    return 'secondary';
  }

  fullName(): string {
    const p = this.item;
    return p ? `${p.lastName ?? ''}, ${p.firstName ?? ''}`.trim() : '—';
  }

  onEdit(): void { if (this.item?.id) this.editRequested.emit(this.item.id); }
  onDelete(): void { if (this.item?.id) this.deleteRequested.emit(this.item.id); }
}
