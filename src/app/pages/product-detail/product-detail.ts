import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Products } from '../../services/products/products';
import { ProductDetails } from '../../interfaces/products.interface';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ToastService } from '../../services/toast/toast.service';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { Breadcrumb } from '../../shared/breadcrumb/breadcrumb';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { VendorInfo, VendorProduct } from '../../interfaces/vendor.interface';

@Component({
  selector: 'app-product-detail',
  imports: [
    CurrencyPipe,
    SkeletonLoader,
    RouterLink,
    Breadcrumb,
    Header,
    Footer,
    NgOptimizedImage,
    Newsletter,
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(Products);
  private readonly toastService = inject(ToastService);
  public wishlistedIds = new Set<string>();
  public product: ProductDetails | null = null;
  public vendorProductsDetails: VendorProduct[] = [];
  public vendorInfo: VendorInfo | null = null;
  public vendorId = '';
  public isLoading = signal(true);
  public isVendorProductsLoading = signal(true);
  public totalPages = 0;
  public currentPage = 1;
  public totalPagesArray: number[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');

      this.product = null;
      this.vendorProductsDetails = [];
      this.vendorInfo = null;
      this.isLoading.set(true);
      this.currentPage = 1;
      this.isVendorProductsLoading.set(true);

      if (slug) {
        this.productService.getProductBySlug(slug).subscribe({
          next: (response) => {
            this.product = response.data;
            this.vendorId = response.data.vendor._id;
            this.isLoading.set(false);
            this.fetchVendorProducts(this.currentPage);
          },
          error: (err) => {
            this.toastService.error('An error occurred while fetching product details. Try again');
            console.error('Failed to fetch product', err);
            this.isLoading.set(false);
          },
        });
      }
    });
  }

  get specifications() {
    if (!this.product) return [];
    return Object.entries(this.product.attributes).map(([label, value]) => ({ label, value }));
  }

  public toggleWishlist(productId: string, productName: string = ''): void {
    if (this.wishlistedIds.has(productId)) {
      this.wishlistedIds.delete(productId);
      this.toastService.success(`${productName} removed from wishlist`);
    } else {
      this.wishlistedIds.add(productId);
      this.toastService.success(`${productName} added to wishlist`);
    }
  }

  private fetchVendorProducts(currentPage: number) {
    this.isVendorProductsLoading.set(true);
    this.productService.getVendorProductsById(this.vendorId, currentPage).subscribe({
      next: (response) => {
        this.vendorProductsDetails = response.data;
        this.vendorInfo = response.vendor;
        this.totalPages = response.pagination.totalPages;
        this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.isVendorProductsLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch vendor products', err);
        this.isVendorProductsLoading.set(false);
      },
    });
  }

  public goToPreviousVendorProducts(): void {
    if (this.currentPage <= 1) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.currentPage--;
    this.fetchVendorProducts(this.currentPage);
  }

  public goToNextVendorProducts(): void {
    if (this.currentPage >= this.totalPages) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.currentPage++;
    this.fetchVendorProducts(this.currentPage);
  }

  public goToPage(pageNumber: number): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.currentPage = pageNumber;
    this.fetchVendorProducts(pageNumber);
  }
}
