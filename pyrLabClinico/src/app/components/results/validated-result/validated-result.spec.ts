import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidatedResult } from './validated-result';

describe('ValidatedResult', () => {
  let component: ValidatedResult;
  let fixture: ComponentFixture<ValidatedResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidatedResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidatedResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
