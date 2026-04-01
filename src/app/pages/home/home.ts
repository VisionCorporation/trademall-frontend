import { Component, inject, signal } from '@angular/core';
import { Header } from '../../shared/header/header';
import { RouterLink } from '@angular/router';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { Footer } from '../../shared/footer/footer';
import { FeaturedCategories } from '../../shared/featured-categories/featured-categories';
import { Products } from '../../services/products/products';
import { ToastService } from '../../services/toast/toast.service';
import { CurrencyPipe } from '@angular/common';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-home',
  imports: [
    Header,
    RouterLink,
    Newsletter,
    Footer,
    FeaturedCategories,
    CurrencyPipe,
    SkeletonLoader,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  animations: [staggerProducts],
})
export class Home {
  private readonly productsService = inject(Products);
  public featuredProducts: FeaturedProduct[] = [];
  public wishlistedIds = new Set<string>();
  private readonly toastService = inject(ToastService);
  public isFeaturedProductsLoading = signal(false);

  ngOnInit() {
    this.isFeaturedProductsLoading.set(true);
    this.productsService.getFeaturedProducts().subscribe({
      next: (response) => {
        this.featuredProducts = response.data;
        this.isFeaturedProductsLoading.set(false);
      },
      error: (error) => {
        this.toastService.error('Failed to load featured products');
        this.isFeaturedProductsLoading.set(false);
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
