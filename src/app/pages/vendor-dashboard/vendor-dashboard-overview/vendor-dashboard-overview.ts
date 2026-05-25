import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { VendorDashboard } from '../../../services/vendor-dashboard/vendor-dashboard';
import { Product } from '../../../interfaces/vendor-dashboard.interface';
import { PERIODS, PRODUCT_STATUS_CONFIG, REVENUE } from '../../../data/constants/vendor-dashbaord.constant';
import { SkeletonLoader } from '../../../shared/skeleton-loader/skeleton-loader';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-vendor-dashboard-overview',
  imports: [CurrencyPipe, DatePipe, SkeletonLoader],
  templateUrl: './vendor-dashboard-overview.html',
  styleUrl: './vendor-dashboard-overview.css',
})
export class VendorDashboardOverview {
  public periods = PERIODS
  public revenue = REVENUE
  public selectedPeriod = 'Monthly';
  public isFetchingProducts = signal(false);
  private vendorDashboardService = inject(VendorDashboard);
  private readonly toastService = inject(ToastService)
  public fetchedProducts: Product[] = [];
  public statusConfig = PRODUCT_STATUS_CONFIG;
  private router = inject(Router);
  public hasProductFailed = signal(false);

  ngOnInit(): void {
    this.fetchVendorProductsListings();
  }

  public fetchVendorProductsListings(): void {
    this.isFetchingProducts.set(true);

    this.vendorDashboardService.getVendorProductListings().subscribe({
      next: (response) => {
        this.fetchedProducts = response.data.slice(3, 6);
        this.isFetchingProducts.set(false);
      },
      error: (error) => {
        console.error('Error fetching vendor product listings:', error);
        this.toastService.error("Failed to load products. Please try again.");
        this.isFetchingProducts.set(false);
        this.hasProductFailed.set(true);
      }
    });
  }

  public navigateToProductsPage(): void {
    this.router.navigate(['/vendor/products']);
  }

  public navigateToAddNewProduct(): void {
    this.router.navigate(['/vendor/add-product']);
  }
}
