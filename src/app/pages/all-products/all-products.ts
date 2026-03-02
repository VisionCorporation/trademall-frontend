import { Component, inject, OnInit } from '@angular/core';
import { Header } from '../../shared/header/header';
import { PRODUCTS } from '../../data/constants/products.constant';
import { CurrencyPipe } from '@angular/common';
import { Products } from '../../services/products/products';
import { Footer } from '../../shared/footer/footer';
import { smoothCollapse } from '../../animations/smooth-collapse.animations';

@Component({
  selector: 'app-all-products',
  imports: [Header, Footer, CurrencyPipe],
  templateUrl: './all-products.html',
  styleUrl: './all-products.css',
  animations: [smoothCollapse],
})
export class AllProducts implements OnInit {
  public readonly products = PRODUCTS;
  private readonly productService = inject(Products);
  public isCategoryOpen = false;

  ngOnInit() {
    this.productService.getAllCategories().subscribe((categories) => {
      console.log('Categories:', categories);
    });

    this.productService.getAllProducts().subscribe((products) => {
      console.log('Products:', products);
    });
  }

  public toggleCategory() {
    this.isCategoryOpen = !this.isCategoryOpen;
  }
}
