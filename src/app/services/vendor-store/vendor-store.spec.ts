import { TestBed } from '@angular/core/testing';

import { VendorStore } from './vendor-store';

describe('VendorStore', () => {
  let service: VendorStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VendorStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
