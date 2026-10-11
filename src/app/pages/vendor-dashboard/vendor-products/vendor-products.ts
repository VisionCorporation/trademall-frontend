import { Component, computed, ElementRef, inject, signal, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { PRODUCT_STATUS_CONFIG, PRODUCTS_FILTERS, SORT_OPTIONS, VISIBILITY_FILTERS } from '../../../data/constants/vendor-dashbaord.constant';
import { VendorDashboard } from '../../../services/vendor-dashboard/vendor-dashboard';
import { Product, ProductImage, ProductPagination, ProductSummary } from '../../../interfaces/vendor-dashboard.interface';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { SkeletonLoader } from '../../../shared/skeleton-loader/skeleton-loader';
import { staggerProducts } from '../../../animations/smooth-collapse.animations';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog/confirm-dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vendor-products',
  imports: [CurrencyPipe, DatePipe, SkeletonLoader, DecimalPipe],
  templateUrl: './vendor-products.html',
  styleUrl: './vendor-products.css',
  animations: [staggerProducts]
})
export class VendorProducts implements OnInit, OnDestroy {
  @ViewChild('filterTabsRef') filterTabsRef!: ElementRef<HTMLElement>;
  private listingsSub?: Subscription;
  public productsFilters = PRODUCTS_FILTERS
  public selectedFilter = 'all'
  public isFetchingProducts = signal(false);
  private vendorDashboardService = inject(VendorDashboard);
  public products = signal<Product[]>([]);
  public pagination = signal<ProductPagination | null>(null);
  public statusConfig = PRODUCT_STATUS_CONFIG;
  private readonly router = inject(Router);
  public deletingProductId = signal<string | null>(null);
  public toastService = inject(ToastService)
  private confirmDialog = inject(ConfirmDialogService);
  public summary = signal<ProductSummary | null>(null);
  public selectedVisibility: '' | 'true' | 'false' = '';
  public togglingVisibilityId = signal<string | null>(null);
  public selectedSort: 'newest' | 'oldest' | 'name' = 'newest';
  public visibilityFilters = VISIBILITY_FILTERS
  public sortOptions = SORT_OPTIONS

  ngOnInit(): void {
    this.fetchVendorProductsListings();
  }

  private fetchVendorProductsListings(page: number = 1, silent = false): void {
    this.listingsSub?.unsubscribe();
    if (!silent) this.isFetchingProducts.set(true);

    this.listingsSub = this.vendorDashboardService.getVendorProductListings(
      page,
      20,
      this.selectedFilter,
      this.selectedVisibility,
      this.selectedSort
    ).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.pagination.set(response.pagination);
        this.summary.set(response.summary);
        this.isFetchingProducts.set(false);
      },
      error: (error) => {
        console.error('Error fetching vendor product listings:', error);
        this.isFetchingProducts.set(false);
      }
    });
  }

  public selectFilter(value: string): void {
    if (value === this.selectedFilter) return;
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
      title: 'Delete this product?',
      message: 'This product will be permanently removed from your store. This action cannot be undone.',
      confirmLabel: 'Delete Product',
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
        this.toastService.error(err.error?.message ?? "We couldn't remove this product at the moment. Please try again.")
        this.deletingProductId.set(null);
      }
    });
  }

  public selectVisibility(value: string) {
    this.selectedVisibility = value as typeof this.selectedVisibility;
    this.fetchVendorProductsListings(1);
  }

  public selectSort(value: string) {
    this.selectedSort = value as typeof this.selectedSort;
    this.fetchVendorProductsListings(1);
  }

  public getTabCount(filter: string): number {
    const s = this.summary();
    if (!s) return 0;
    const key = this.selectedVisibility === 'true' ? 'visible'
      : this.selectedVisibility === 'false' ? 'hidden' : 'total';
    if (filter === 'all') {
      return key === 'total' ? s.total : s.visibility[key];
    }
    return s.byStatus[filter as keyof ProductSummary['byStatus']][key];
  }

  public getVisibilityCount(value: string): number {
    const s = this.summary();
    if (!s) return 0;
    const scope = this.selectedFilter === 'all'
      ? { total: s.total, ...s.visibility }
      : s.byStatus[this.selectedFilter as keyof ProductSummary['byStatus']];
    return value === 'true' ? scope.visible : value === 'false' ? scope.hidden : scope.total;
  }

  public hasDiscount(p: Product): boolean {
    return p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price;
  }

  public discountPercent(p: Product): number {
    return Math.round(((p.price - (p.salePrice ?? p.price)) / p.price) * 100);
  }

  public toggleVisibility(product: Product): void {
    if (this.togglingVisibilityId()) return;

    this.togglingVisibilityId.set(product._id);

    this.vendorDashboardService.toggleProductVisibility(product._id).subscribe({
      next: (res) => {
        this.products.update(list =>
          list.map(p => p._id === product._id ? { ...p, isVisible: !p.isVisible } : p)
        );
        this.togglingVisibilityId.set(null);
        this.toastService.success(res.message ?? 'Product toggled successfully');

        const current = this.pagination()?.currentPage ?? 1;
        const leavesList = this.selectedVisibility !== '' && this.products().length === 1 && current > 1;
        this.fetchVendorProductsListings(leavesList ? current - 1 : current, true);
      },
      error: (err) => {
        console.error('Error toggling visibility:', err);
        this.toastService.error(err.error?.message ?? "We couldn't update visibility. Please try again.");
        this.togglingVisibilityId.set(null);
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

  ngOnDestroy(): void {
    this.listingsSub?.unsubscribe();
  }
}

