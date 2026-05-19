import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { VendorDashboard } from '../../../../services/vendor-dashboard/vendor-dashboard';
import { Product } from '../../../../interfaces/vendor-dashboard.interface';
import { PRODUCT_STATUS_CONFIG } from '../../../../data/constants/vendor-dashbaord.constant';
import { SkeletonLoader } from '../../../../shared/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-vendor-dashboard-overview',
  imports: [CurrencyPipe, DatePipe, SkeletonLoader],
  templateUrl: './vendor-dashboard-overview.html',
  styleUrl: './vendor-dashboard-overview.css',
})
export class VendorDashboardOverview {
  public periods = ['Weekly', 'Monthly', 'Yearly'];
  public selectedPeriod = 'Monthly';
  public isFetchingProducts = signal(false);
  private vendorDashboardService = inject(VendorDashboard);
  public fetchedProducts: Product[] = [];
  public statusConfig = PRODUCT_STATUS_CONFIG;

  revenue: Record<string, number> = {
    Weekly: 4320,
    Monthly: 17750,
    Yearly: 213000,
  };

  ngOnInit(): void {
    this.fetchVendorProductsListings();
  }

  private fetchVendorProductsListings(): void {
    this.isFetchingProducts.set(true);

    this.vendorDashboardService.getVendorProductListings().subscribe({
      next: (response) => {
        this.fetchedProducts = response.data.slice(3, 6);
        this.isFetchingProducts.set(false);
      },
      error: (error) => {
        console.error('Error fetching vendor product listings:', error);
        this.isFetchingProducts.set(false);
      }
    });
  }
}
