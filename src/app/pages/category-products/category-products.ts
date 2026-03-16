import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Products } from '../../services/products/products';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../interfaces/products.interface';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-category-products',
  imports: [SkeletonLoader, Header, Footer, RouterLink, CurrencyPipe],
  templateUrl: './category-products.html',
  styleUrl: './category-products.css',
  animations: [staggerProducts],
})
export class CategoryProducts implements OnInit {
  public isProductsLoading = signal(true);
  public isSubCategoriesLoading = signal(true);
  public openCategorySlug: string | null = null;
  public selectedCategorySlug: string | null = null;
  public selectedCategoryProducts: Product[] = [];
  private readonly productService = inject(Products);
  private readonly route = inject(ActivatedRoute);
  public subCategories: any[] = [];
  public categoryName = '';
  public wishlistedIds = new Set<string>();
  private readonly toastService = inject(ToastService);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug) {
      this.productService.getCategoryWithDirectChildren(slug).subscribe({
        next: (res) => {
          this.categoryName = res.data.category.name;
          this.subCategories = res.data.children;
          this.isProductsLoading.set(false);
          this.isSubCategoriesLoading.set(false);

          if (this.subCategories.length > 0) {
            this.selectedCategorySlug = this.subCategories[0].slug;
            this.fetchProductsByCategory(this.selectedCategorySlug!);
          } else {
            this.isProductsLoading.set(false);
          }
        },
        error: (err) => {
          console.error('Failed to fetch product', err);
          this.isProductsLoading.set(false);
          this.isSubCategoriesLoading.set(false);
        },
      });
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

  public toggleWishlist(productId: string, productName: string = ''): void {
    if (this.wishlistedIds.has(productId)) {
      this.wishlistedIds.delete(productId);
      this.toastService.success(`${productName} removed from wishlist`);
    } else {
      this.wishlistedIds.add(productId);
      this.toastService.success(`${productName} added to wishlist`);
    }
    console.log('Wishlisted IDs:', Array.from(this.wishlistedIds));
  }
}
