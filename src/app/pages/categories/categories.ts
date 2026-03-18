import { Component, inject, OnInit, signal } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { Products } from '../../services/products/products';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { RootCategory } from '../../interfaces/categories.interface';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { RouterLink } from '@angular/router';
import { Newsletter } from '../../shared/newsletter/newsletter';

@Component({
  selector: 'app-categories',
  imports: [Header, Footer, SkeletonLoader, RouterLink, Newsletter],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  animations: [staggerProducts],
})
export class Categories implements OnInit {
  private categoryService = inject(Products);
  public categories: RootCategory[] = [];
  public totalPages = 0;
  public isLoading = signal(true);
  public currentPage = 1;
  public totalPagesArray: number[] = [];

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

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.isLoading.set(true);
    this.currentPage--;
    this.fetchCategories(this.currentPage);
  }

  public goToNextCategories(): void {
    if (this.currentPage >= this.totalPages) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.isLoading.set(true);
    this.currentPage++;
    this.fetchCategories(this.currentPage);
  }

  public goToPage(pageNumber: number) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.isLoading.set(true);
    this.fetchCategories(pageNumber);
    this.currentPage = pageNumber;
  }
}
