import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Products } from '../../services/products/products';
import { Product } from '../../interfaces/products.interface';
import { CurrencyPipe } from '@angular/common';
import { ToastService } from '../../services/toast/toast.service';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, SkeletonLoader],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(Products);
  private readonly toastService = inject(ToastService);

  public product: Product | null = null;
  public isLoading = signal(true);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug) {
      this.productService.getProductBySlug(slug).subscribe({
        next: (response) => {
          this.product = response.data;
          console.log('Fetched product:', this.product);
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
}
