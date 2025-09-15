import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPanels } from './all-panels';

describe('AllPanels', () => {
  let component: AllPanels;
  let fixture: ComponentFixture<AllPanels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPanels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllPanels);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
