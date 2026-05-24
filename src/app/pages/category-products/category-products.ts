import { Component, inject, OnInit, OnDestroy, signal, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Products } from '../../services/products/products';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ProductDetails } from '../../interfaces/products.interface';
import { smoothCollapse, staggerProducts } from '../../animations/smooth-collapse.animations';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { SearchBar } from '../../shared/search-bar/search-bar';
import { CartState } from '../../services/cart/cart-state';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-category-products',
  imports: [SkeletonLoader, Header, Footer, Newsletter, SearchBar, ProductCard],
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
  public subCategories: any[] = [];
  public categoryName = '';
  private _isFilterOpen = false;
  private grandChildMap = new Map<string, string[]>();
  private readonly productService = inject(Products);
  private readonly route = inject(ActivatedRoute);
  private readonly renderer = inject(Renderer2);
  private readonly cartState = inject(CartState);

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
    this.cartState.loadCart();
    const slug = this.route.snapshot.paramMap.get('slug');
    const filterSlug = history.state?.filter;
    history.replaceState({}, '');

    if (!slug) return;

    this.productService.getSubCategories(slug).subscribe({
      next: (category) => {
        this.categoryName = category.parent.name;
        this.subCategories = category.data;
        this.isSubCategoriesLoading.set(false);
      }
    });

    this.productService.getProductsByCategory(slug).subscribe({
      next: (products) => {
        this.allProducts = products.data;
        this.isProductsLoading.set(false);

        if (filterSlug) {
          this.selectedCategorySlugs = [filterSlug];
          this.resolveAndFilter(filterSlug);
        }
      },
      error: (err) => {
        console.error(err);
        this.isProductsLoading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'overflow-hidden');
  }

  public onCategoryChange(slug: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isFilterOpen = false;

    if (isChecked) {
      this.selectedCategorySlugs = [...this.selectedCategorySlugs, slug];
      this.resolveAndFilter(slug);
    } else {
      this.selectedCategorySlugs = this.selectedCategorySlugs.filter((s) => s !== slug);
      this.filterProductsLocally();
    }
  }

  private resolveAndFilter(slug: string): void {
    if (this.grandChildMap.has(slug)) {
      this.filterProductsLocally();
      return;
    }

    this.isProductsLoading.set(true);

    this.productService.getSubCategories(slug).subscribe({
      next: (res) => {
        if (res.data.length === 0) {
          this.grandChildMap.set(slug, [slug]);
        } else {
          const childSlugs = res.data.map((c: any) => c.slug);
          this.grandChildMap.set(slug, childSlugs);
        }
        this.filterProductsLocally();
        this.isProductsLoading.set(false);
      },
      error: () => this.isProductsLoading.set(false),
    });
  }

  private filterProductsLocally(): void {
    if (this.selectedCategorySlugs.length === 0) {
      this.selectedCategoryProducts = [];
      return;
    }
    const resolvedSlugs = this.selectedCategorySlugs.flatMap((slug) =>
      this.grandChildMap.get(slug) ?? [slug]
    );

    this.selectedCategoryProducts = this.allProducts.filter((p) =>
      resolvedSlugs.includes(p.category?.slug ?? '')
    );
  }

  public removeCategory(slug: string): void {
    this.selectedCategorySlugs = this.selectedCategorySlugs.filter((s) => s !== slug);
    this.filterProductsLocally();
  }

  public get displayedProducts(): ProductDetails[] {
    return this.selectedCategorySlugs.length > 0 ? this.selectedCategoryProducts : this.allProducts;
  }

  public getCategoryName(slug: string): string {
    return this.subCategories.find((c) => c.slug === slug)?.name ?? slug;
  }
}
