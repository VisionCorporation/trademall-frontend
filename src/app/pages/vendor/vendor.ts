import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Products } from '../../services/products/products';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
// import { Product } from '../../interfaces/products.interface';
import { ProductsResponse } from '../../interfaces/vendor.interface';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { staggerProducts } from '../../animations/smooth-collapse.animations';

@Component({
  selector: 'app-vendor',
  imports: [Header, Footer, DatePipe, RouterLink, CurrencyPipe],
  templateUrl: './vendor.html',
  styleUrl: './vendor.css',
  animations: [staggerProducts],
})
export class Vendor {
  private productService = inject(Products);
  private readonly route = inject(ActivatedRoute);
  public vendorData: ProductsResponse | null = null;
  public isLoading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.productService.getVendorProductsById(id).subscribe({
        next: (response) => {
          this.vendorData = response;
          // console.log('Fetched vendor data:', this.vendorData);
          this.isLoading.set(false);
        },
        error: (err) => {
          // this.toastService.error('An error occurred while fetching vendor details. Try again');
          console.error('Failed to fetch vendor data', err);
          this.isLoading.set(false);
        },
      });
    }
  }
}
