import { TestBed } from '@angular/core/testing';

import { BucketSetlistService } from './bucket-setlist.service';

describe('BucketSetlistService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BucketSetlistService = TestBed.get(BucketSetlistService);
    expect(service).toBeTruthy();
  });
});
