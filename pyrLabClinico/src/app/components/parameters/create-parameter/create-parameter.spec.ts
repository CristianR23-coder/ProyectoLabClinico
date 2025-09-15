import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateParameter } from './create-parameter';

describe('CreateParameter', () => {
  let component: CreateParameter;
  let fixture: ComponentFixture<CreateParameter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateParameter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateParameter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
