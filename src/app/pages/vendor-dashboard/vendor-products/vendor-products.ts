import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { PRODUCT_STATUS_CONFIG, PRODUCTS_FILTERS } from '../../../data/constants/vendor-dashbaord.constant';
import { VendorDashboard } from '../../../services/vendor-dashboard/vendor-dashboard';
import { Product, ProductImage, ProductPagination } from '../../../interfaces/vendor-dashboard.interface';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { SkeletonLoader } from '../../../shared/skeleton-loader/skeleton-loader';
import { staggerProducts } from '../../../animations/smooth-collapse.animations';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog/confirm-dialog';

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
  public products = signal<Product[]>([]);
  public pagination = signal<ProductPagination | null>(null);
  public statusConfig = PRODUCT_STATUS_CONFIG;
  private readonly router = inject(Router);
  public deletingProductId = signal<string | null>(null);
  public toastService = inject(ToastService)
  private confirmDialog = inject(ConfirmDialogService);

  ngOnInit(): void {
    this.fetchVendorProductsListings();
  }

  private fetchVendorProductsListings(page: number = 1): void {
    this.isFetchingProducts.set(true);

    this.vendorDashboardService.getVendorProductListings(page, 20, this.selectedFilter).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.pagination.set(response.pagination);
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
    this.fetchVendorProductsListings(1);

    setTimeout(() => {
      const activeBtn = this.filterTabsRef.nativeElement.querySelector(`[data-filter="${value}"]`);
      activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 0);
  }

  public goToPage(page: number): void {
    const totalPages = this.pagination()?.totalPages ?? 1;
    if (page < 1 || page > totalPages || page === this.pagination()?.currentPage) return;

    this.fetchVendorProductsListings(page);
  }

  public navigateToEditProduct(productId: string): void {
    this.router.navigate(['/vendor/edit-product', productId]);
  }

  public async deleteProduct(productId: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete product?',
      message: 'This will permanently remove the product from your store. This can’t be undone.',
      confirmLabel: 'Delete',
      variant: 'danger'
    });

    if (!confirmed) return;

    this.deletingProductId.set(productId);

    this.vendorDashboardService.deleteProduct(productId).subscribe({
      next: (res) => {
        const current = this.pagination()?.currentPage ?? 1;
        const nextPage = this.products().length === 1 && current > 1 ? current - 1 : current;
        this.fetchVendorProductsListings(nextPage);
        this.deletingProductId.set(null);
        this.toastService.success(res.message ?? "Product has been removed successfully.")
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.toastService.error(err.error.message ?? "We couldn't remove this product at the moment. Please try again.")
        this.deletingProductId.set(null);
      }
    });
  }

  public navigateToAddNewProduct(): void {
    this.router.navigate(['/vendor/add-product']);
  }

  public getMainImageUrl(images: ProductImage[]): string {
    return images.find(image => image.isMain)?.url
      ?? images[0]?.url
  }

  public showingRange = computed(() => {
    const p = this.pagination();
    if (!p || p.totalResults === 0) return null;

    const start = (p.currentPage - 1) * p.limit + 1;
    const end = start + this.products().length - 1;

    return { start, end, total: p.totalResults };
  });

  public pageNumbers = computed<(number | '...')[]>(() => {
    const p = this.pagination();
    if (!p) return [];

    const total = p.totalPages;
    const current = p.currentPage;

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('...');
    pages.push(total);

    return pages;
  });
}
