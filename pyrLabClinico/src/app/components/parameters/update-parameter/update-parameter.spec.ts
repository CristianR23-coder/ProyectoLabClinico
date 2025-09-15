import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateParameter } from './update-parameter';

describe('UpdateParameter', () => {
  let component: UpdateParameter;
  let fixture: ComponentFixture<UpdateParameter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateParameter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateParameter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
