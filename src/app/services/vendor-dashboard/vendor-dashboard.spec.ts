import { TestBed } from '@angular/core/testing';

import { VendorDashboard } from './vendor-dashboard';

describe('VendorDashboard', () => {
  let service: VendorDashboard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VendorDashboard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
