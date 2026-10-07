import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorStoreForm } from './vendor-store-form';

describe('VendorStoreForm', () => {
  let component: VendorStoreForm;
  let fixture: ComponentFixture<VendorStoreForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorStoreForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorStoreForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
