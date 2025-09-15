import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllInsurances } from './all-insurances';

describe('AllInsurances', () => {
  let component: AllInsurances;
  let fixture: ComponentFixture<AllInsurances>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllInsurances]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllInsurances);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
