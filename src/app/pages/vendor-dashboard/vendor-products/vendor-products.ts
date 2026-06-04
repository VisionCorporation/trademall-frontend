import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { PRODUCT_STATUS_CONFIG, PRODUCTS_FILTERS } from '../../../data/constants/vendor-dashbaord.constant';
import { VendorDashboard } from '../../../services/vendor-dashboard/vendor-dashboard';
import { Product, ProductsResponse } from '../../../interfaces/vendor-dashboard.interface';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { SkeletonLoader } from '../../../shared/skeleton-loader/skeleton-loader';
import { staggerProducts } from '../../../animations/smooth-collapse.animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vendor-products',
  imports: [CurrencyPipe, DatePipe, SkeletonLoader],
  templateUrl: './vendor-products.html',
  styleUrl: './vendor-products.css',
  animations: [staggerProducts]
})
export class VendorProducts {
  @ViewChild('filterTabsRef') filterTabsRef!: ElementRef<HTMLElement>;
  public productsFilters = PRODUCTS_FILTERS
  public selectedFilter = 'all'
  public hoveredFilter: string | null = null;
  public isFetchingProducts = signal(false);
  private vendorDashboardService = inject(VendorDashboard);
  public fetchedProducts: Product[] = [];
  public statusConfig = PRODUCT_STATUS_CONFIG;
  public filteredProducts = signal<Product[]>([]);
  private readonly router = inject(Router);

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

  public selectFilter(value: string): void {
    this.selectedFilter = value;
    this.filteredProducts.set(
      value === 'all'
        ? this.fetchedProducts
        : this.fetchedProducts.filter(product => product.status === value)
    );

    setTimeout(() => {
      const activeBtn = this.filterTabsRef.nativeElement.querySelector(`[data-filter="${value}"]`);
      activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 0);
  }

  public navigateToAddNewProduct(): void {
    this.router.navigate(['/vendor/add-product']);
  }
}
