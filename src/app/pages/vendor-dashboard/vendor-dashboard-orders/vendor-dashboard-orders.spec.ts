import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorDashboardOrders } from './vendor-dashboard-orders/vendor-dashboard-orders';

describe('VendorDashboardOrders', () => {
  let component: VendorDashboardOrders;
  let fixture: ComponentFixture<VendorDashboardOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorDashboardOrders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorDashboardOrders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
