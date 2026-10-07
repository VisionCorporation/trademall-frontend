import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { storeEditGuard } from './store-edit-guard';

describe('storeEditGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => storeEditGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
