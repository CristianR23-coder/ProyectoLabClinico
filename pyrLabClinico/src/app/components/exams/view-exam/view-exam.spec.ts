import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExam } from './view-exam';

describe('ViewExam', () => {
  let component: ViewExam;
  let fixture: ComponentFixture<ViewExam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewExam]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewExam);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
