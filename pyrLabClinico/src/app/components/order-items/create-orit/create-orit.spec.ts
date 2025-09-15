import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrit } from './create-orit';

describe('CreateOrit', () => {
  let component: CreateOrit;
  let fixture: ComponentFixture<CreateOrit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
