import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateExam } from './update-exam';

describe('UpdateExam', () => {
  let component: UpdateExam;
  let fixture: ComponentFixture<UpdateExam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateExam]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateExam);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
