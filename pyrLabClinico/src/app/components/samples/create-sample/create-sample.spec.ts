import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSample } from './create-sample';

describe('CreateSample', () => {
  let component: CreateSample;
  let fixture: ComponentFixture<CreateSample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSample]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSample);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
