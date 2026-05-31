import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorApplicationStatus } from './vendor-application-status';

describe('VendorApplicationStatus', () => {
  let component: VendorApplicationStatus;
  let fixture: ComponentFixture<VendorApplicationStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorApplicationStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorApplicationStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
