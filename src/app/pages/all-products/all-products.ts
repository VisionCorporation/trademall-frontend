import { Component, inject, OnInit, signal } from '@angular/core';
import { Header } from '../../shared/header/header';
import { PRODUCTS } from '../../data/constants/products.constant';
import { CurrencyPipe } from '@angular/common';
import { Products } from '../../services/products/products';
import { Footer } from '../../shared/footer/footer';
import { smoothCollapse, staggerProducts } from '../../animations/smooth-collapse.animations';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-all-products',
  imports: [Header, Footer, CurrencyPipe, SkeletonLoader],
  templateUrl: './all-products.html',
  styleUrl: './all-products.css',
  animations: [smoothCollapse, staggerProducts],
})
export class AllProducts implements OnInit {
  public products = PRODUCTS;
  private readonly productService = inject(Products);
  public isCategoryOpen = false;
  public isProductsLoading = signal(false);
  ngOnInit() {
    this.isProductsLoading.set(true);
    setTimeout(() => {
      this.isProductsLoading.set(false);
    }, 2000);
  }

  public toggleCategory() {
    this.isCategoryOpen = !this.isCategoryOpen;
  }
}
