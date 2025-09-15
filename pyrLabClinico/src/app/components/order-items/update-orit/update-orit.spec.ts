import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateOrit } from './update-orit';

describe('UpdateOrit', () => {
  let component: UpdateOrit;
  let fixture: ComponentFixture<UpdateOrit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateOrit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateOrit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
