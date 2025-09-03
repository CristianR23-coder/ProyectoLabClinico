import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateResult } from './update-result';

describe('UpdateResult', () => {
  let component: UpdateResult;
  let fixture: ComponentFixture<UpdateResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
