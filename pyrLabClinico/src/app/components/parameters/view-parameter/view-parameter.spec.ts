import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewParameter } from './view-parameter';

describe('ViewParameter', () => {
  let component: ViewParameter;
  let fixture: ComponentFixture<ViewParameter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewParameter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewParameter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
