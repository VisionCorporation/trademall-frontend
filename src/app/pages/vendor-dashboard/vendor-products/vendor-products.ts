import { Component, computed, ElementRef, inject, signal, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { PRODUCT_STATUS_CONFIG, PRODUCTS_FILTERS, SORT_OPTIONS, VISIBILITY_FILTERS } from '../../../data/constants/vendor-dashbaord.constant';
import { VendorDashboard } from '../../../services/vendor-dashboard/vendor-dashboard';
import { Product, ProductImage, ProductPagination, ProductSummary } from '../../../interfaces/vendor-dashboard.interface';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { SkeletonLoader } from '../../../shared/skeleton-loader/skeleton-loader';
import { cardLeave, staggerProducts } from '../../../animations/smooth-collapse.animations';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast/toast.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog/confirm-dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vendor-products',
  imports: [CurrencyPipe, DatePipe, SkeletonLoader, DecimalPipe],
  templateUrl: './vendor-products.html',
  styleUrl: './vendor-products.css',
  animations: [staggerProducts, cardLeave]
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

  private adjustSummaryOnDelete(product: Product): void {
    this.summary.update(s => {
      if (!s) return s;
      const key = product.isVisible ? 'visible' : 'hidden';
      const st = s.byStatus[product.status];
      return {
        ...s,
        total: s.total - 1,
        visibility: { ...s.visibility, [key]: s.visibility[key] - 1 },
        byStatus: {
          ...s.byStatus,
          [product.status]: { ...st, total: st.total - 1, [key]: st[key] - 1 },
        },
      };
    });
  }

  public async deleteProduct(productId: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete this product?',
      message: 'This product will be permanently removed from your store. This action cannot be undone.',
      confirmLabel: 'Delete Product',
      variant: 'danger'
    });

    if (!confirmed) return;

    const product = this.products().find(p => p._id === productId);
    this.deletingProductId.set(productId);

    this.vendorDashboardService.deleteProduct(productId).subscribe({
      next: (res) => {
        const current = this.pagination()?.currentPage ?? 1;
        const wasLastOnPage = this.products().length === 1;
        const targetPage = wasLastOnPage && current > 1 ? current - 1 : current;

        this.products.update(list => list.filter(p => p._id !== productId));

        this.pagination.update(p =>
          p ? { ...p, totalResults: Math.max(0, p.totalResults - 1) } : p
        );
        if (product) this.adjustSummaryOnDelete(product);

        this.deletingProductId.set(null);
        this.toastService.success(res.message ?? "Product has been removed successfully.");

        this.fetchVendorProductsListings(targetPage, true);
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.toastService.error(err.error?.message ?? "We couldn't remove this product at the moment. Please try again.");
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

  private adjustSummary(status: Product['status'], toVisible: boolean): void {
    this.summary.update(s => {
      if (!s) return s;
      const d = toVisible ? 1 : -1;
      const st = s.byStatus[status];
      return {
        ...s,
        visibility: { visible: s.visibility.visible + d, hidden: s.visibility.hidden - d },
        byStatus: {
          ...s.byStatus,
          [status]: { ...st, visible: st.visible + d, hidden: st.hidden - d },
        },
      };
    });
  }

  public toggleVisibility(product: Product): void {
    if (this.togglingVisibilityId()) return;

    this.togglingVisibilityId.set(product._id);

    this.vendorDashboardService.toggleProductVisibility(product._id).subscribe({
      next: (res) => {
        const nowVisible = !product.isVisible;

        const leavesFilter =
          this.selectedVisibility !== '' &&
          (this.selectedVisibility === 'true') !== nowVisible;

        const current = this.pagination()?.currentPage ?? 1;
        const wasLastOnPage = this.products().length === 1;

        this.products.update(list =>
          leavesFilter
            ? list.filter(p => p._id !== product._id)
            : list.map(p => p._id === product._id ? { ...p, isVisible: nowVisible } : p)
        );

        const targetPage = leavesFilter && wasLastOnPage && current > 1 ? current - 1 : current;

        if (leavesFilter) {
          this.pagination.update(p =>
            p ? { ...p, totalResults: Math.max(0, p.totalResults - 1), currentPage: targetPage } : p
          );
        }

        this.adjustSummary(product.status, nowVisible);

        this.togglingVisibilityId.set(null);
        this.toastService.success(res.message ?? 'Product toggled successfully');


        this.fetchVendorProductsListings(targetPage, true);
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

