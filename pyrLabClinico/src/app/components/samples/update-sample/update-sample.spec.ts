import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSample } from './update-sample';

describe('UpdateSample', () => {
  let component: UpdateSample;
  let fixture: ComponentFixture<UpdateSample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSample]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateSample);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
