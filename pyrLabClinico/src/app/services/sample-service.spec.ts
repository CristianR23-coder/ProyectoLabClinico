import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SamplesService } from './sample-service';

describe('SamplesService', () => {
  let service: SamplesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SamplesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
