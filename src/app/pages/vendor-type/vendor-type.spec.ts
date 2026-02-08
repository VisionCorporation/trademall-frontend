import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorType } from './vendor-type';

describe('VendorType', () => {
  let component: VendorType;
  let fixture: ComponentFixture<VendorType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
