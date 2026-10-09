import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { StoreResponse } from '../../interfaces/vendor.interface';
import { DatePipe } from '@angular/common';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { ToastService } from '../../services/toast/toast.service';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { SkeletonLoader } from "../../shared/skeleton-loader/skeleton-loader";
import { VendorStoreService } from '../../services/vendor-store/vendor-store';
import { Seo } from '../../services/seo/seo';
import { VendorProductsResponse } from '../../interfaces/product-card.interface';
import { ProductCard } from '../../shared/product-card/product-card';
import { fadeInOutAnimation } from '../../animations/toast.animations';

@Component({
  selector: 'app-vendor',
  imports: [Header, Footer, DatePipe, Newsletter, SkeletonLoader, ProductCard],
  templateUrl: './vendor.html',
  styleUrl: './vendor.css',
  animations: [staggerProducts, fadeInOutAnimation],
  host: { '(document:keydown.escape)': 'closeAbout()' },
})
export class Vendor {
  private vendorStoreService = inject(VendorStoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(Seo);
  public vendorStoreData: StoreResponse | null = null
  public vendorProducts: VendorProductsResponse | null = null
  public wishlistedIds = new Set<string>();
  private readonly toastService = inject(ToastService);
  public openPolicy: string | null = null;
  public isStoreLoading = signal(true);
  public isVendorProductLoading = signal(true);
  public storeError = signal(false);
  public productsError = signal(false);
  public isAboutOpen = signal(false);

  ngOnInit(): void {
    this.loadStore();
    this.loadVendorProducts();
  }

  private loadStore(): void {
    this.isStoreLoading.set(true);
    this.storeError.set(false);

    const id = this.route.snapshot.paramMap.get('id');

    this.vendorStoreService.getPublicStorePage('nastrade').subscribe({
      next: (res) => {
        this.vendorStoreData = res;
        this.isStoreLoading.set(false);

        this.seoService.updatePageSeo({
          title: `${res.store.name} | TradeMall`,
          description: `Shop ${res.store.name} on TradeMall — ${res.store.description}.`,
          url: `https://trademall-frontend.vercel.app/products/vendor/${id}`,
          image: res.store.banner ?? res.store.logo ?? 'https://trademall-frontend.vercel.app/assets/og-default.jpg'
        });
      },
      error: (err) => {
        this.toastService.error('Failed to fetch store data')
        console.error('Failed to fetch store data. Try again', err);
        this.storeError.set(true);
        this.isStoreLoading.set(false);
      },
    });
  }

  private loadVendorProducts(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isVendorProductLoading.set(false);
      return;
    }

    this.isVendorProductLoading.set(true);
    this.productsError.set(false);

    this.vendorStoreService.getVendorProductsById(id, 1).subscribe({
      next: (response) => {
        this.vendorProducts = response;
        this.isVendorProductLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch vendor products', err);
        this.toastService.error("Failed to fetch vendor's products. Try again");
        this.productsError.set(true);
        this.isVendorProductLoading.set(false);
      },
    });
  }

  public get policies() {
    return [
      { title: 'Shipping Policy', content: this.vendorStoreData?.store.shippingPolicy },
      { title: 'Return Policy', content: this.vendorStoreData?.store.returnPolicy },
      { title: 'Terms and Conditions', content: this.vendorStoreData?.store.termsAndConditions },
    ];
  }

  public openAbout() {
    this.isAboutOpen.set(true);
  }

  public closeAbout() {
    this.isAboutOpen.set(false);
    this.openPolicy = null;
  }

  public togglePolicy(title: string) {
    this.openPolicy = this.openPolicy === title ? null : title;
  }
}
