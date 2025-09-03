import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSample } from './view-sample';

describe('ViewSample', () => {
  let component: ViewSample;
  let fixture: ComponentFixture<ViewSample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSample]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSample);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
