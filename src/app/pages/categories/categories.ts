import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { Products } from '../../services/products/products';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { RootCategory } from '../../interfaces/categories.interface';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { RouterLink } from '@angular/router';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { SearchBar } from '../../shared/search-bar/search-bar';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { NgOptimizedImage } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-categories',
  imports: [Header, Footer, SkeletonLoader, RouterLink, Newsletter, SearchBar, NgOptimizedImage],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  animations: [staggerProducts, fadeInOutAnimation],
})
export class Categories implements OnInit {
  private categoryService = inject(Products);
  public categories: RootCategory[] = [];
  public totalPages = 0;
  public isLoading = signal(true);
  public currentPage = 1;
  public totalPagesArray: number[] = [];
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.fetchCategories(this.currentPage);
  }

  private fetchCategories(currentPage: number) {
    this.categoryService.getRootCategories(currentPage).subscribe({
      next: (response) => {
        this.categories = response.data;
        this.totalPages = response.pagination.totalPages;
        this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch categories', err);
        this.isLoading.set(false);
      },
    });
  }

  public goToPreviousCategories(): void {
    if (this.currentPage <= 1) return;

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.isLoading.set(true);
    this.currentPage--;
    this.fetchCategories(this.currentPage);
  }

  public goToNextCategories(): void {
    if (this.currentPage >= this.totalPages) return;

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.isLoading.set(true);
    this.currentPage++;
    this.fetchCategories(this.currentPage);
  }

  public goToPage(pageNumber: number) {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    this.isLoading.set(true);
    this.fetchCategories(pageNumber);
    this.currentPage = pageNumber;
  }

  public getSearchValue(value: Event) {
    console.log(value)
  }
}
