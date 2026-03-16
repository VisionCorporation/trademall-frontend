import { Component, inject, OnInit, signal } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { Products } from '../../services/products/products';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { RootCategory } from '../../interfaces/categories.interface';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-categories',
  imports: [Header, Footer, SkeletonLoader, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  animations: [staggerProducts],
})
export class Categories implements OnInit {
  private categoryService = inject(Products);
  public categories: RootCategory[] = [];
  public isLoading = signal(true);

  ngOnInit() {
    this.categoryService.getRootCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch categories', err);
        this.isLoading.set(false);
      },
    });
  }
}
