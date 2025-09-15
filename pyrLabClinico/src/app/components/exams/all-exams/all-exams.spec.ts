import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllExams } from './all-exams';

describe('AllExams', () => {
  let component: AllExams;
  let fixture: ComponentFixture<AllExams>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllExams]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllExams);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
