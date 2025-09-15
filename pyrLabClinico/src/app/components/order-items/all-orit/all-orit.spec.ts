import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllOrit } from './all-orit';

describe('AllOrit', () => {
  let component: AllOrit;
  let fixture: ComponentFixture<AllOrit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllOrit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllOrit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
