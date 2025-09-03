import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateResult } from './create-result';

describe('CreateResult', () => {
  let component: CreateResult;
  let fixture: ComponentFixture<CreateResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
