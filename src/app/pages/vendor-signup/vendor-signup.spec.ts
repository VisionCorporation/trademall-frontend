import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorSignup } from './vendor-signup';

describe('VendorSignup', () => {
  let component: VendorSignup;
  let fixture: ComponentFixture<VendorSignup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorSignup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorSignup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
