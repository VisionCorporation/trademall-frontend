import { Component, ElementRef, OnInit, OnDestroy, ViewChild, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Products as ProductsService } from '../../services/products/products';
import { ToastService } from '../../services/toast/toast.service';
import { ProductCard } from '../../shared/product-card/product-card';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HERO_SECTION_TAGS, SORT_OPTIONS } from '../../data/constants/shop.constant';
import { ProductCardInterface } from '../../interfaces/product-card.interface';
import { RootCategory } from '../../interfaces/categories.interface';
import { forkJoin } from 'rxjs';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { FormsModule } from '@angular/forms';
import { Seo } from '../../services/seo/seo';

@Component({
  selector: 'app-shop',
  imports: [ProductCard, SkeletonLoader, Header, Footer, Newsletter, RouterLink, FormsModule],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
  animations: [fadeInOutAnimation, staggerProducts]
})
export class Shop implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly productsService = inject(ProductsService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(Seo);
  public readonly router = inject(Router)
  public isMobileFiltersOpen = signal(false);
  public categories = signal<RootCategory[]>([]);
  public isCategoriesLoading = signal(false);
  public selectedCategorySlugs: string[] = [];
  public searchValidationError = signal(false);
  public searchQuery: string | null = null;
  public products = signal<ProductCardInterface[]>([]);
  public currentPage = signal(1);
  public totalPages = signal(1);
  public isLoading = signal(false);
  public isLoadingMore = signal(false);
  public hasErrorCategories = signal(false);
  public hasErrorProducts = signal(false);
  public totalResults = signal(0);
  public sortOptions = SORT_OPTIONS
  public selectedSortOption: string = this.sortOptions[0].value;
  public sortedProducts = signal<ProductCardInterface[]>([]);
  public heroSectionTags = HERO_SECTION_TAGS

  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef<HTMLDivElement>;
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.loadCategories();

    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['q']?.trim() ?? null;
      this.selectedCategorySlugs = params['category']
        ? params['category'].split(',').filter(Boolean)
        : [];

      if (this.searchQuery && this.searchQuery.length < 2) {
        this.searchValidationError.set(true);
        this.products.set([]);
        this.searchQuery = "";
        this.updateSeo();
        return;
      }

      this.searchValidationError.set(false);
      this.updateSeo();
      this.loadProducts(1);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  public selectHeroCategory(slug: string): void {
    this.router.navigate(['/shop'], {
      queryParams: { category: slug },
    });
  }

  private updateSeo(): void {
    const isSearch = !!this.searchQuery;

    this.seoService.updatePageSeo({
      title: isSearch
        ? `Search results for "${this.searchQuery}" | TradeMall`
        : 'Shop All Products | TradeMall',
      description: isSearch
        ? `Browse results for "${this.searchQuery}" on TradeMall. Compare products from trusted sellers and find exactly what you're looking for.`
        : 'Browse the full TradeMall catalog. Filter by category, compare prices, and shop products from verified sellers across every category on the platform.',
      url: isSearch
        ? `https://trademall-frontend.vercel.app/shop?q=${encodeURIComponent(this.searchQuery ?? '')}`
        : 'https://trademall-frontend.vercel.app/shop',
      image: 'https://trademall-frontend.vercel.app/assets/images/og-home.jpeg',
    });
  }

  private sortProducts(list: ProductCardInterface[], sortValue: string): ProductCardInterface[] {
    const sorted = [...list];
    switch (sortValue) {
      case 'price_asc': return sorted.sort((a, b) => a.effectivePrice - b.effectivePrice);
      case 'price_desc': return sorted.sort((a, b) => b.effectivePrice - a.effectivePrice);
      case 'name_asc': return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc': return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating_desc': return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating_asc': return sorted.sort((a, b) => a.rating - b.rating);
      default: return sorted;
    }
  }

  private applySort(): void {
    this.sortedProducts.set(this.sortProducts(this.products(), this.selectedSortOption));
  }

  public onSortChange(): void {
    this.applySort();
  }

  private loadCategories(): void {
    this.isCategoriesLoading.set(true);
    this.hasErrorCategories.set(false);

    this.productsService.getRootCategories(1).subscribe({
      next: (firstPage) => {
        const { totalPages } = firstPage.pagination;

        if (totalPages <= 1) {
          this.categories.set(this.sortCategories(firstPage.data));
          this.isCategoriesLoading.set(false);
          return;
        }

        const remainingPages$ = Array.from({ length: totalPages - 1 }, (_, i) =>
          this.productsService.getRootCategories(i + 2)
        );

        forkJoin(remainingPages$).subscribe({
          next: (restPages) => {
            const allCategories = [
              ...firstPage.data,
              ...restPages.flatMap((res) => res.data),
            ];
            this.categories.set(this.sortCategories(allCategories));
            this.isCategoriesLoading.set(false);
          },
          error: (err) => {
            console.error('Failed to load remaining categories', err);
            this.categories.set(this.sortCategories(firstPage.data));
            this.isCategoriesLoading.set(false);
          },
        });
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.hasErrorCategories.set(true);
        this.isCategoriesLoading.set(false);
      },
    });
  }

  private sortCategories(list: RootCategory[]): RootCategory[] {
    return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public get hasMore(): boolean {
    return this.currentPage() < this.totalPages();
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
    const categories = this.selectedCategorySlugs.length ? this.selectedCategorySlugs : undefined;

    const request$ = query
      ? this.productsService.searchProduct(query, page, categories)
      : this.productsService.getAllProducts(page, categories);

    const isFirstPage = page === 1;
    isFirstPage ? this.isLoading.set(true) : this.isLoadingMore.set(true);
    this.hasErrorProducts.set(false);

    request$.subscribe({
      next: (res) => {
        this.products.set(isFirstPage ? res.data : [...this.products(), ...res.data]);
        this.applySort();
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
        this.hasErrorProducts.set(true);
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

  public retryLoadCategories(): void {
    this.loadCategories();
  }

  public searchFor(term: string) {
    this.router.navigate(['/shop'], {
      queryParams: { q: term }
    })
  }

  public toggleMobileFilters(): void {
    this.isMobileFiltersOpen.update(v => !v);
  }

  public closeMobileFilters(): void {
    this.isMobileFiltersOpen.set(false);
  }

  public onCategoryChange(slug: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    const updatedSlugs = checked
      ? [...this.selectedCategorySlugs, slug]
      : this.selectedCategorySlugs.filter((s) => s !== slug);

    this.router.navigate(['/shop'], {
      queryParams: {
        q: null,
        category: updatedSlugs.length ? updatedSlugs.join(',') : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  public clearCategoryFilters(): void {
    this.router.navigate(['/shop'], {
      queryParams: { category: null },
      queryParamsHandling: 'merge',
    });
  }

  public clearSearch(): void {
    this.router.navigate(['/shop'], {
      queryParams: { q: null },
      queryParamsHandling: 'merge',
    });
  }

  public getCategoryName(slug: string): string {
    return this.categories().find((category) => category.slug === slug)?.name ?? slug;
  }
}