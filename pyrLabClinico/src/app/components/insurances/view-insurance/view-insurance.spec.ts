import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInsurance } from './view-insurance';

describe('ViewInsurance', () => {
  let component: ViewInsurance;
  let fixture: ComponentFixture<ViewInsurance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewInsurance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewInsurance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
