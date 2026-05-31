import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { vendorApprovalGuard } from './vendor-approval-guard';

describe('vendorApprovalGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => vendorApprovalGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
