import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePanel } from './update-panel';

describe('UpdatePanel', () => {
  let component: UpdatePanel;
  let fixture: ComponentFixture<UpdatePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatePanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
