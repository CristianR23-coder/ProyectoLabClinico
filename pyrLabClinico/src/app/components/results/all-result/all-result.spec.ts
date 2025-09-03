import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllResult } from './all-result';

describe('AllResult', () => {
  let component: AllResult;
  let fixture: ComponentFixture<AllResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
