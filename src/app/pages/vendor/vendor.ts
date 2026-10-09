import { Component, ElementRef, inject, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { StoreResponse } from '../../interfaces/vendor.interface';
import { DatePipe } from '@angular/common';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { ToastService } from '../../services/toast/toast.service';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { SkeletonLoader } from "../../shared/skeleton-loader/skeleton-loader";
import { VendorStoreService } from '../../services/vendor-store/vendor-store';
import { Seo } from '../../services/seo/seo';
import { ProductCardInterface } from '../../interfaces/product-card.interface';
import { ProductCard } from '../../shared/product-card/product-card';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { Pagination } from '../../interfaces/product-card.interface'

@Component({
  selector: 'app-vendor',
  imports: [Header, Footer, DatePipe, Newsletter, SkeletonLoader, ProductCard],
  templateUrl: './vendor.html',
  styleUrl: './vendor.css',
  animations: [staggerProducts, fadeInOutAnimation],
  host: { '(document:keydown.escape)': 'closeAbout()' },
})
export class Vendor {
  private readonly platformId = inject(PLATFORM_ID);
  private vendorStoreService = inject(VendorStoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(Seo);
  public currentPage = signal(1);
  public totalPages = signal(1);
  public isLoadingMore = signal(false);
  public storeName = ''
  public vendorStoreData: StoreResponse | null = null
  public vendorProducts = signal<ProductCardInterface[]>([]);
  public vendorProductsPagination: Pagination | null = null
  public wishlistedIds = new Set<string>();
  private readonly toastService = inject(ToastService);
  public openPolicy: string | null = null;
  public isStoreLoading = signal(true);
  public isVendorProductLoading = signal(true);
  public storeError = signal(false);
  public productsError = signal(false);
  public isAboutOpen = signal(false);
  private isProductsRequestInProgress = false;

  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef<HTMLDivElement>;
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.loadStore();
    this.loadVendorProducts(1);
  }

  private loadStore(): void {
    this.isStoreLoading.set(true);
    this.storeError.set(false);

    const id = this.route.snapshot.paramMap.get('id');

    this.vendorStoreService.getPublicStorePage('nastrade').subscribe({
      next: (res) => {
        this.vendorStoreData = res;
        this.storeName = res.store.name
        this.isStoreLoading.set(false);

        this.seoService.updatePageSeo({
          title: `${res.store.name} | TradeMall`,
          description: `Shop ${res.store.name} on TradeMall — ${res.store.description}.`,
          url: `https://trademall-frontend.vercel.app/products/vendor/${id}`,
          image: res.store.banner ?? res.store.logo ?? 'https://trademall-frontend.vercel.app/assets/og-default.jpg'
        });
      },
      error: (err) => {
        this.toastService.error('Failed to fetch store data')
        console.error('Failed to fetch store data. Try again', err);
        this.storeError.set(true);
        this.isStoreLoading.set(false);
      },
    });
  }

  private loadVendorProducts(page: number): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id || this.isProductsRequestInProgress) {
      return;
    }

    const isFirstPage = page === 1;

    this.isProductsRequestInProgress = true;

    if (isFirstPage) {
      this.isVendorProductLoading.set(true);
    } else {
      this.isLoadingMore.set(true);
    }

    this.productsError.set(false);

    this.vendorStoreService.getVendorProductsById(id, page).subscribe({
      next: (response) => {
        this.vendorProducts.update((products) => {
          if (isFirstPage) {
            return response.data;
          }

          const existingIds = new Set(products.map((product) => product.id));
          const uniqueNewProducts = response.data.filter(
            (product) => !existingIds.has(product.id),
          );

          return [...products, ...uniqueNewProducts];
        });

        this.currentPage.set(response.pagination.currentPage);
        this.totalPages.set(response.pagination.totalPages);
        this.vendorProductsPagination = response.pagination;

        this.isProductsRequestInProgress = false;
        this.isVendorProductLoading.set(false);
        this.isLoadingMore.set(false);

        if (isFirstPage) {
          setTimeout(() => this.setupObserver());
        }
      },
      error: (err) => {
        console.error('Failed to fetch vendor products', err);

        this.productsError.set(true);
        this.isProductsRequestInProgress = false;
        this.isVendorProductLoading.set(false);
        this.isLoadingMore.set(false);

        this.toastService.error(
          isFirstPage
            ? "Failed to fetch vendor's products. Try again"
            : 'Failed to load more products',
        );
      },
    });
  }

  public retryLoad(): void {
    const page =
      this.vendorProducts().length === 0 ? 1 : this.currentPage() + 1;

    this.loadVendorProducts(page);
  }

  public get hasMore(): boolean {
    return this.currentPage() < this.totalPages();
  }

  private setupObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.observer || !this.scrollSentinel) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          this.hasMore &&
          !this.isLoadingMore() &&
          !this.isVendorProductLoading() &&
          !this.isProductsRequestInProgress
        ) {
          this.loadVendorProducts(this.currentPage() + 1);
        }
      },
      { rootMargin: '200px' },
    );

    this.observer.observe(this.scrollSentinel.nativeElement);
  }

  public get policies() {
    return [
      { title: 'Shipping Policy', content: this.vendorStoreData?.store.shippingPolicy },
      { title: 'Return Policy', content: this.vendorStoreData?.store.returnPolicy },
      { title: 'Terms and Conditions', content: this.vendorStoreData?.store.termsAndConditions },
    ];
  }

  public openAbout() {
    this.isAboutOpen.set(true);
  }

  public closeAbout() {
    this.isAboutOpen.set(false);
    this.openPolicy = null;
  }

  public togglePolicy(title: string) {
    this.openPolicy = this.openPolicy === title ? null : title;
  }
}
