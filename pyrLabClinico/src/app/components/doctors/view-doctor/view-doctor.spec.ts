import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDoctor } from './view-doctor';

describe('ViewDoctor', () => {
  let component: ViewDoctor;
  let fixture: ComponentFixture<ViewDoctor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDoctor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDoctor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
