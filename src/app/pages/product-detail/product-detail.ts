import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Products } from '../../services/products/products';
import { ProductDetails } from '../../interfaces/products.interface';
import { CurrencyPipe } from '@angular/common';
import { ToastService } from '../../services/toast/toast.service';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { Breadcrumb } from '../../shared/breadcrumb/breadcrumb';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, SkeletonLoader, RouterLink, Breadcrumb, Header, Footer],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(Products);
  private readonly toastService = inject(ToastService);
  public categoryName = '';
  public categorySlug = '';
  public selectedSubCategorySlug = '';
  public wishlistedIds = new Set<string>();
  public product: ProductDetails | null = null;
  public isLoading = signal(true);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    this.categoryName = history.state?.category;
    this.categorySlug = history.state?.slug;
    this.selectedSubCategorySlug = history.state?.subcategorySlug;

    if (slug) {
      this.productService.getProductBySlug(slug).subscribe({
        next: (response) => {
          this.product = response.data;
          this.isLoading.set(false);
        },
        error: (err) => {
          this.toastService.error('An error occurred while fetching product details. Try again');
          console.error('Failed to fetch product', err);
          this.isLoading.set(false);
        },
      });
    }
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
