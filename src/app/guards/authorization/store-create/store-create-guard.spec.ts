import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { storeCreateGuard } from './store-create-guard';

describe('storeCreateGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => storeCreateGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
