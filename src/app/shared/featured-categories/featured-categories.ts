import { Component, inject, signal } from '@angular/core';
import { Products } from '../../services/products/products';
import { RootCategory } from '../../interfaces/categories.interface';
import { NgOptimizedImage } from '@angular/common';
import { SkeletonLoader } from '../skeleton-loader/skeleton-loader';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-featured-categories',
  imports: [NgOptimizedImage, SkeletonLoader, RouterLink],
  templateUrl: './featured-categories.html',
  styleUrl: './featured-categories.css',
  animations: [staggerProducts],
})
export class FeaturedCategories {
  private categoryService = inject(Products);
  public leftCategories: RootCategory[] = [];
  public centerCategory: RootCategory | null = null;
  public rightCategory: RootCategory | null = null;
  public isLoading = signal(false);

  ngOnInit(): void {
    this.fetchFeaturedCategories();
  }

  private fetchFeaturedCategories() {
    this.isLoading.set(true);
    this.categoryService.getRootCategories().subscribe({
      next: (response) => {
        const featured = response.data.slice(0, 4);
        this.leftCategories = featured.slice(0, 2);
        this.centerCategory = featured[2];
        this.rightCategory = featured[3];
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch categories', err);
        this.isLoading.set(false);
      },
    });
  }
}
