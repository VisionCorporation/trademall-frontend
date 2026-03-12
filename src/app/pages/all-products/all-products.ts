import { Component, inject, OnInit, signal } from '@angular/core';
import { Header } from '../../shared/header/header';
import { CurrencyPipe } from '@angular/common';
import { Products } from '../../services/products/products';
import { Footer } from '../../shared/footer/footer';
import { smoothCollapse, staggerProducts } from '../../animations/smooth-collapse.animations';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { Category } from '../../interfaces/categories.interface';
import { Product } from '../../interfaces/products.interface';

@Component({
  selector: 'app-all-products',
  imports: [Header, Footer, CurrencyPipe, SkeletonLoader],
  templateUrl: './all-products.html',
  styleUrl: './all-products.css',
  animations: [smoothCollapse, staggerProducts],
})
export class AllProducts implements OnInit {
  private readonly productService = inject(Products);
  public isProductsLoading = signal(false);
  public categories: Category[] = [];
  public childrenCategories: Category[] = [];
  public openCategorySlug: string | null = null;
  public selectedCategorySlug: string | null = null;
  public selectedCategoryProducts: Product[] = [];

  ngOnInit() {
    this.isProductsLoading.set(true);

    this.productService.getAllCategoriesWithChildren().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isProductsLoading.set(false);
      },
      error: (err) => console.error('Failed to fetch categories', err),
    });
  }

  public toggleCategory(categorySlug: string) {
    this.openCategorySlug = this.openCategorySlug === categorySlug ? null : categorySlug;

    if (this.openCategorySlug) {
      this.childrenCategories = this.productService.getChildrenFromCache(categorySlug);
    }
  }

  public onCategoryChange(slug: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.selectedCategorySlug = slug;
      this.fetchProductsByCategory(slug);
    } else {
      this.selectedCategorySlug = null;
      this.selectedCategoryProducts = [];
    }
  }

  private fetchProductsByCategory(categorySlug: string): void {
    this.isProductsLoading.set(true);

    this.productService.getProductsByCategory(categorySlug).subscribe({
      next: (products) => {
        this.selectedCategoryProducts = products.data;
        this.isProductsLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch products', err);
        this.isProductsLoading.set(false);
      },
    });
  }
}
