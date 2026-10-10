import { Component, effect, ElementRef, inject, PLATFORM_ID, signal, ViewChild, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { StoreDomainService } from '../../services/store-domain/store-domain';

@Component({
  selector: 'app-vendor',
  imports: [Header, Footer, DatePipe, Newsletter, SkeletonLoader, ProductCard, RouterLink],
  templateUrl: './vendor.html',
  styleUrl: './vendor.css',
  animations: [staggerProducts, fadeInOutAnimation],
  host: {
    '(document:keydown.escape)': 'closeAbout(); closeShare()',
    '(window:resize)': 'updateShareArrows()',
  },
})
export class Vendor {
  private readonly platformId = inject(PLATFORM_ID);
  private vendorStoreService = inject(VendorStoreService);
  private readonly storeDomainService = inject(StoreDomainService);
  private vendorId: string | null = null;
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
  public isShareOpen = signal(false);
  public isLinkCopied = signal(false);
  public isAboutOpen = signal(false);
  private isProductsRequestInProgress = false;
  public notFound = signal(false)
  public canScrollPrev = signal(false);
  public canScrollNext = signal(false);
  private readonly shareRow = viewChild<ElementRef<HTMLDivElement>>('shareRow');

  constructor() {
    effect(() => {
      if (this.shareRow()) this.updateShareArrows();
    });
  }

  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef<HTMLDivElement>;
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.loadStore();
  }

  public loadStore(): void {
    const subdomain = this.storeDomainService.getStoreSubdomain();

    if (!subdomain) {
      this.storeError.set(true);
      return;
    }

    this.isStoreLoading.set(true);
    this.storeError.set(false);

    this.vendorStoreService.getStoreWithSubdomain(subdomain).subscribe({
      next: (res) => {
        this.vendorStoreData = res;
        this.storeName = res.store.name;
        this.vendorId = res.vendor._id;
        this.isStoreLoading.set(false);

        this.loadVendorProducts(1);

        this.seoService.updatePageSeo({
          title: `${res.store.name} | TradeMall`,
          description: `Shop ${res.store.name} on TradeMall — ${res.store.description}.`,
          url: `https://${subdomain}.trademall.shop`,
          image:
            res.store.banner ??
            res.store.logo ??
            'https://trademall.shop/assets/og-default.jpg',
        });
      },
      error: (err) => {
        if (err.status === 404) {
          this.notFound.set(true)
        }

        console.error(err.error.message ?? 'Failed to fetch store data', err);
        this.storeError.set(true);
        this.isStoreLoading.set(false);
        this.isVendorProductLoading.set(false);
        this.toastService.error(err.error.message ?? 'Failed to fetch store data');
      },
    });
  }

  private loadVendorProducts(page: number): void {
    const id = this.vendorId;

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

  public get storeUrl(): string {
    return this.storeDomainService.getStoreUrl(this.vendorStoreData!.store.subdomain);
  }

  public updateShareArrows(): void {
    const el = this.shareRow()?.nativeElement;
    if (!el) return;

    this.canScrollPrev.set(el.scrollLeft > 0);
    this.canScrollNext.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  public scrollShare(direction: 1 | -1): void {
    const el = this.shareRow()?.nativeElement;
    if (!el) return;

    el.scrollBy({ left: direction * el.clientWidth * 0.75, behavior: 'smooth' });
  }

  public get shareTargets() {
    const store = this.vendorStoreData?.store;
    if (!store) return [];

    const url = encodeURIComponent(this.storeUrl);
    const text = encodeURIComponent(`Check out ${store.name} on TradeMall`);

    return [
      { name: 'WhatsApp', icon: 'whatsapp', href: `https://wa.me/?text=${text}%20${url}` },
      { name: 'Facebook', icon: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
      { name: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/', copyFirst: true },
      { name: 'TikTok', icon: 'tiktok', href: 'https://www.tiktok.com/', copyFirst: true },
      { name: 'X', icon: 'x', href: `https://twitter.com/intent/tweet?text=${text}&url=${url}` },
      { name: 'Telegram', icon: 'telegram', href: `https://t.me/share/url?url=${url}&text=${text}` },
      { name: 'LinkedIn', icon: 'linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
    ];
  }

  public openShare() {
    this.isShareOpen.set(true);
  }

  public closeShare() {
    this.isShareOpen.set(false);
    this.isLinkCopied.set(false);
  }

  public async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.storeUrl);
      this.isLinkCopied.set(true);
      setTimeout(() => this.isLinkCopied.set(false), 3000);
      this.toastService.success('Store link copied. Paste it in your post, story or message.')
    } catch {
      this.toastService.error('Could not copy link');
    }
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
