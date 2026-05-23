import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorAddProduct } from './vendor-add-product';

describe('VendorAddProduct', () => {
  let component: VendorAddProduct;
  let fixture: ComponentFixture<VendorAddProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorAddProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorAddProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
