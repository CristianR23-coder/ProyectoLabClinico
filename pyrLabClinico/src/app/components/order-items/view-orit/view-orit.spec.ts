import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrit } from './view-orit';

describe('ViewOrit', () => {
  let component: ViewOrit;
  let fixture: ComponentFixture<ViewOrit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewOrit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewOrit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
