import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorDashboardOverview } from './vendor-dashboard-overview';

describe('VendorDashboardOverview', () => {
  let component: VendorDashboardOverview;
  let fixture: ComponentFixture<VendorDashboardOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorDashboardOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorDashboardOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
