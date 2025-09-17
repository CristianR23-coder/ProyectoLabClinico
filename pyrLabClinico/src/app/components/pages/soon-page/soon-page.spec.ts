import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoonPage } from './soon-page';

describe('SoonPage', () => {
  let component: SoonPage;
  let fixture: ComponentFixture<SoonPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoonPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
