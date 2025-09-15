import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePanel } from './create-panel';

describe('CreatePanel', () => {
  let component: CreatePanel;
  let fixture: ComponentFixture<CreatePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
