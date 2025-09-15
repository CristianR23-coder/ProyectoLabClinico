import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllParameters } from './all-parameters';

describe('AllParameters', () => {
  let component: AllParameters;
  let fixture: ComponentFixture<AllParameters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllParameters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllParameters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
