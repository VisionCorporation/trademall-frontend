import { Component, inject, OnInit, OnDestroy, signal, Renderer2 } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Products } from '../../services/products/products';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { CurrencyPipe } from '@angular/common';
import { ProductDetails } from '../../interfaces/products.interface';
import { smoothCollapse, staggerProducts } from '../../animations/smooth-collapse.animations';
import { ToastService } from '../../services/toast/toast.service';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { SearchBar } from '../../shared/search-bar/search-bar';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-category-products',
  imports: [SkeletonLoader, Header, Footer, RouterLink, CurrencyPipe, Newsletter, SearchBar],
  templateUrl: './category-products.html',
  styleUrl: './category-products.css',
  animations: [staggerProducts, fadeInOutAnimation, smoothCollapse],
})
export class CategoryProducts implements OnInit, OnDestroy {
  public allProducts: ProductDetails[] = [];
  public isProductsLoading = signal(true);
  public isSubCategoriesLoading = signal(true);
  public openCategorySlug: string | null = null;
  public selectedCategorySlugs: string[] = [];
  public selectedCategoryProducts: ProductDetails[] = [];
  private readonly productService = inject(Products);
  private readonly route = inject(ActivatedRoute);
  private readonly renderer = inject(Renderer2);
  private readonly toastService = inject(ToastService);
  public subCategories: any[] = [];
  public categoryName = '';
  public wishlistedIds = new Set<string>();
  private _isFilterOpen = false;

  public set isFilterOpen(value: boolean) {
    this._isFilterOpen = value;
    if (value) {
      this.renderer.addClass(document.body, 'overflow-hidden');
    } else {
      this.renderer.removeClass(document.body, 'overflow-hidden');
    }
  }

  public get isFilterOpen(): boolean {
    return this._isFilterOpen;
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    const filterSlug = history.state?.filter;
    history.replaceState({}, '');

    if (!slug) return;

    forkJoin({
      category: this.productService.getCategoryWithDirectChildren(slug),
      products: this.productService.getProductsByCategory(slug),
    }).subscribe({
      next: ({ category, products }) => {
        this.categoryName = category.data.category.name;
        this.subCategories = category.data.children;
        this.allProducts = products.data;

        this.isSubCategoriesLoading.set(false);
        this.isProductsLoading.set(false);

        if (filterSlug) {
          this.selectedCategorySlugs = [filterSlug];

          this.selectedCategoryProducts = this.allProducts.filter(
            (p) => p.category?.slug === filterSlug,
          );
        }
      },
      error: (err) => {
        console.error(err);
        this.isProductsLoading.set(false);
        this.isSubCategoriesLoading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'overflow-hidden');
  }

  public onCategoryChange(slug: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.selectedCategorySlugs = [...this.selectedCategorySlugs, slug];
    } else {
      this.selectedCategorySlugs = this.selectedCategorySlugs.filter((s) => s !== slug);
    }

    this.isFilterOpen = false;
    this.fetchSelectedCategoryProducts();
  }

  get displayedProducts(): ProductDetails[] {
    return this.selectedCategorySlugs.length > 0 ? this.selectedCategoryProducts : this.allProducts;
  }

  public getCategoryName(slug: string): string {
    return this.subCategories.find((c) => c.slug === slug)?.name ?? slug;
  }

  public removeCategory(slug: string): void {
    this.selectedCategorySlugs = this.selectedCategorySlugs.filter((s) => s !== slug);
    this.fetchSelectedCategoryProducts();
  }

  private fetchSelectedCategoryProducts(): void {
    if (this.selectedCategorySlugs.length === 0) {
      this.selectedCategoryProducts = [];
      return;
    }

    this.isProductsLoading.set(true);

    const requests = this.selectedCategorySlugs.map((slug) =>
      this.productService.getProductsByCategory(slug),
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        this.selectedCategoryProducts = results.flatMap((r) => r.data);
        this.isProductsLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch products for selected categories', err);
        this.isProductsLoading.set(false);
      },
    });
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
}
