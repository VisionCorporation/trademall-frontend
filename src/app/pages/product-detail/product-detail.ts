import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Products } from '../../services/products/products';
import { Product } from '../../interfaces/products.interface';
import { CurrencyPipe } from '@angular/common';


@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(Products);

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
          console.error('Failed to fetch product', err);
          this.isLoading.set(false);
        }
      });
    }
  }
}