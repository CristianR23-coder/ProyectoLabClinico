import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPanel } from './view-panel';

describe('ViewPanel', () => {
  let component: ViewPanel;
  let fixture: ComponentFixture<ViewPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
