import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackSamples } from './track-samples';

describe('TrackSamples', () => {
  let component: TrackSamples;
  let fixture: ComponentFixture<TrackSamples>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackSamples]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackSamples);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
