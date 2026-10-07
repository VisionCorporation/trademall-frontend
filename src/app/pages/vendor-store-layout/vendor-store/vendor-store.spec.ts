import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorStore } from './vendor-store';

describe('VendorStore', () => {
  let component: VendorStore;
  let fixture: ComponentFixture<VendorStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorStore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
