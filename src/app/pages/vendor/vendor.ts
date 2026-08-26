import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { StoreResponse, VendorProductsResponse } from '../../interfaces/vendor.interface';
import { CurrencyPipe, DatePipe, NgOptimizedImage } from '@angular/common';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { ToastService } from '../../services/toast/toast.service';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { SkeletonLoader } from "../../shared/skeleton-loader/skeleton-loader";
import { BUTTONS, DEFAULT_HERO_IMAGE } from '../../data/constants/vendor-page.constant';
import { VendorStore } from '../../services/vendor-store/vendor-store';

@Component({
  selector: 'app-vendor',
  imports: [Header, Footer, DatePipe, RouterLink, CurrencyPipe, Newsletter, SkeletonLoader, NgOptimizedImage],
  templateUrl: './vendor.html',
  styleUrl: './vendor.css',
  animations: [staggerProducts],
})
export class Vendor {
  private vendorStoreService = inject(VendorStore);
  private readonly route = inject(ActivatedRoute);
  public vendorStoreData: StoreResponse | null = null
  public vendorProducts: VendorProductsResponse | null = null
  public wishlistedIds = new Set<string>();
  private readonly toastService = inject(ToastService);
  public buttons = BUTTONS
  public openPolicy: string | null = null;
  public activeTab = 'products';
  public isStoreLoading = signal(true);
  public isVendorProductLoading = signal(true);
  public storeError = signal(false);
  public productsError = signal(false);
  public heroImageLoaded = false;
  public heroImage: string = DEFAULT_HERO_IMAGE;

  ngOnInit(): void {
    this.loadStore();
    this.loadVendorProducts();
  }

  private loadStore(): void {
    this.isStoreLoading.set(true);
    this.storeError.set(false);

    this.vendorStoreService.getPublicStorePage('nastrade').subscribe({
      next: (res) => {
        this.vendorStoreData = res;
        this.heroImageLoaded = true;
        this.heroImage = res.store.banner ?? DEFAULT_HERO_IMAGE;
        this.isStoreLoading.set(false);
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

  public switchButtons(tab: string) {
    this.activeTab = tab;
  }

  public get policies() {
    return [
      { title: 'Shipping Policy', content: this.vendorStoreData?.store.shippingPolicy },
      { title: 'Return Policy', content: this.vendorStoreData?.store.returnPolicy },
      { title: 'Terms and Conditions', content: this.vendorStoreData?.store.termsAndConditions },
    ];
  }

  public togglePolicy(title: string) {
    this.openPolicy = this.openPolicy === title ? null : title;
  }
}
