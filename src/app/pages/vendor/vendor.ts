import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Products } from '../../services/products/products';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { VendorInfo, VendorProductsResponse } from '../../interfaces/vendor.interface';
import { CurrencyPipe, DatePipe, NgOptimizedImage } from '@angular/common';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { ToastService } from '../../services/toast/toast.service';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { SkeletonLoader } from "../../shared/skeleton-loader/skeleton-loader";

@Component({
  selector: 'app-vendor',
  imports: [Header, Footer, DatePipe, RouterLink, CurrencyPipe, Newsletter, NgOptimizedImage, SkeletonLoader],
  templateUrl: './vendor.html',
  styleUrl: './vendor.css',
  animations: [staggerProducts],
})
export class Vendor {
  private productService = inject(Products);
  private readonly route = inject(ActivatedRoute);
  public vendorData: VendorProductsResponse | null = null;
  public vendorInfo: VendorInfo | null = null;
  public isLoading = signal(true);
  public wishlistedIds = new Set<string>();
  private readonly toastService = inject(ToastService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.productService.getVendorProductsById(id).subscribe({
        next: (response) => {
          this.vendorData = response;
          this.vendorInfo = response.vendor
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to fetch vendor data', err);
          this.toastService.error("An occurred while fetching vendor's details. Try again")
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
