import { Component, ElementRef, OnInit, OnDestroy, ViewChild, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Products as ProductsService } from '../../services/products/products';
import { ToastService } from '../../services/toast/toast.service';
import { ProductCard } from '../../shared/product-card/product-card';
import { Product } from '../../interfaces/all-products.interface';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { POPULAR_SEARCHES } from '../../data/constants/shop.constant';

@Component({
  selector: 'app-shop',
  imports: [ProductCard, SkeletonLoader, Header, Footer, Newsletter, RouterLink],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productsService = inject(ProductsService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  public readonly router = inject(Router)
  public popularSearches = POPULAR_SEARCHES
  public searchValidationError = signal(false);
  public searchQuery: string | null = null;
  public products = signal<Product[]>([]);
  public currentPage = signal(1);
  public totalPages = signal(1);
  public isLoading = signal(false);
  public isLoadingMore = signal(false);
  public hasError = signal(false);
  public totalResults = signal(0);

  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef<HTMLDivElement>;
  private observer?: IntersectionObserver;

  public get hasMore(): boolean {
    return this.currentPage() < this.totalPages();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['q']?.trim() ?? null;

      if (this.searchQuery && this.searchQuery.length < 2) {
        this.searchValidationError.set(true);
        this.products.set([]);
        this.searchQuery = ""
        return;
      }

      this.searchValidationError.set(false);
      this.loadProducts(1);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private setupObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.observer || !this.scrollSentinel) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasMore && !this.isLoadingMore() && !this.isLoading()) {
          setTimeout(() => this.loadProducts(this.currentPage() + 1));
        }
      },
      { rootMargin: '200px' }
    );
    this.observer.observe(this.scrollSentinel.nativeElement);
  }

  private loadProducts(page: number): void {
    const query = this.searchQuery?.trim() ?? '';

    const request$ = query
      ? this.productsService.searchProduct(query, page)
      : this.productsService.getAllProducts(page);

    const isFirstPage = page === 1;
    isFirstPage ? this.isLoading.set(true) : this.isLoadingMore.set(true);
    this.hasError.set(false);


    request$.subscribe({
      next: (res) => {
        this.products.set(isFirstPage ? res.data : [...this.products(), ...res.data]);
        this.currentPage.set(res.pagination.currentPage);
        this.totalPages.set(res.pagination.totalPages);
        this.totalResults.set(res.pagination.totalResults);
        isFirstPage ? this.isLoading.set(false) : this.isLoadingMore.set(false);

        if (isFirstPage) {
          setTimeout(() => this.setupObserver());
        }
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.hasError.set(true);
        isFirstPage ? this.isLoading.set(false) : this.isLoadingMore.set(false);
        if (!isFirstPage) {
          this.toastService.error('Failed to load more products');
        }
      },
    });
  }

  public retryLoad(): void {
    this.loadProducts(this.currentPage() === 1 ? 1 : this.currentPage());
  }

  public searchFor(term: string) {
    this.router.navigate(['/shop'], {
      queryParams: { q: term }
    })
  }
}