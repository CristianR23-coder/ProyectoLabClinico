import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

import { InsurancesService } from '../../../services/insurance-service';
import { InsuranceI } from '../../../models/insurance-model';

@Component({
  selector: 'app-view-insurance',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, ButtonModule],
  templateUrl: './view-insurance.html'
})
export class ViewInsurance implements OnInit {
  @Input() insuranceId?: number;
  @Output() editRequested = new EventEmitter<number>();
  @Output() deleteRequested = new EventEmitter<number>();

  private svc = inject(InsurancesService);
  item?: InsuranceI;
  loading = true;

  ngOnInit(): void {
    if (!this.insuranceId) { this.loading = false; return; }
    this.svc.getById(this.insuranceId).subscribe(x => { this.item = x; this.loading = false; });
  }

  severity(s?: 'ACTIVE' | 'INACTIVE'): 'success' | 'danger' | undefined {
    return s === 'ACTIVE' ? 'success' : s === 'INACTIVE' ? 'danger' : undefined;
  }

  onEdit() { if (this.item?.id) this.editRequested.emit(this.item.id); }
  onDelete() { if (this.item?.id) this.deleteRequested.emit(this.item.id); }
}
