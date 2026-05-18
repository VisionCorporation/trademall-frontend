import { Component, inject, signal } from '@angular/core';
import { PRODUCT_STATUS_CONFIG, PRODUCTS_FILTERS } from '../../../data/constants/vendor-dashbaord.constant';
import { VendorDashboard } from '../../../services/vendor-dashboard/vendor-dashboard';
import { Product, ProductsResponse } from '../../../interfaces/vendor-dashboard.interface';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { SkeletonLoader } from '../../../shared/skeleton-loader/skeleton-loader';
import { staggerProducts } from '../../../animations/smooth-collapse.animations';

@Component({
  selector: 'app-vendor-products',
  imports: [CurrencyPipe, DatePipe, SkeletonLoader],
  templateUrl: './vendor-products.html',
  styleUrl: './vendor-products.css',
  animations: [staggerProducts]
})
export class VendorProducts {
  public productsFilters = PRODUCTS_FILTERS
  public selectedFilter = 'all'
  public hoveredFilter: string | null = null;
  public isFetchingProducts = signal(false);
  private vendorDashboardService = inject(VendorDashboard);
  public fetchedProducts: Product[] = [];
  public statusConfig = PRODUCT_STATUS_CONFIG;
  public filteredProducts = signal<Product[]>([]);

  ngOnInit(): void {
    this.fetchVendorProductsListings();
  }

  private fetchVendorProductsListings(): void {
    this.isFetchingProducts.set(true);

    this.vendorDashboardService.getVendorProductListings().subscribe({
      next: (response) => {
        this.fetchedProducts = response.data;
        this.filteredProducts.set(this.fetchedProducts);
        this.isFetchingProducts.set(false);
      },
      error: (error) => {
        console.error('Error fetching vendor product listings:', error);
        this.isFetchingProducts.set(false);
      }
    });
  }

  public selectFilter(filterValue: string): void {
    this.selectedFilter = filterValue;
    this.filteredProducts.set(
      filterValue === 'all'
        ? this.fetchedProducts
        : this.fetchedProducts.filter(product => product.status === filterValue)
    );
  }
}
