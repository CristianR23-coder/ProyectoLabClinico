import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSample } from './all-sample';

describe('AllSample', () => {
  let component: AllSample;
  let fixture: ComponentFixture<AllSample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllSample]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllSample);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
