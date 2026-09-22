import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { Products } from '../../services/products/products';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { Pagination, RootCategory } from '../../interfaces/categories.interface';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { RouterLink } from '@angular/router';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { SearchBar } from '../../shared/search-bar/search-bar';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { NgOptimizedImage } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Seo } from '../../services/seo/seo';

@Component({
  selector: 'app-categories',
  imports: [Header, Footer, SkeletonLoader, RouterLink, Newsletter, SearchBar, NgOptimizedImage],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  animations: [staggerProducts, fadeInOutAnimation],
})
export class Categories implements OnInit {
  private readonly seoService = inject(Seo);
  private categoryService = inject(Products);
  public categories: RootCategory[] = [];
  public isLoading = signal(true);
  public currentPage = 1;
  public pagination = signal<Pagination | null>(null);
  private platformId = inject(PLATFORM_ID);

  public pageNumbers = computed<(number | '...')[]>(() => {
    const p = this.pagination();
    if (!p) return [];

    const total = p.totalPages;
    const current = p.currentPage;

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('...');
    pages.push(total);

    return pages;
  });

  constructor() {
    this.seoService.updatePageSeo({
      title: 'Shop by Category | Electronics, Fashion & More | TradeMall',
      description: "Browse various categories on TradeMall — electronics, computing, beauty care, fashion, home essentials, and more from trusted sellers across Ghana.",
      url: 'https://trademall-frontend.vercel.app/categories',
      image: 'https://trademall-frontend.vercel.app/assets/images/og-default.jpeg'
    });
  }

  ngOnInit() {
    this.fetchCategories(this.currentPage);
  }

  private fetchCategories(currentPage: number) {
    this.categoryService.getRootCategories(currentPage).subscribe({
      next: (response) => {
        this.categories = response.data;
        this.pagination.set(response.pagination);
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
    this.goToPage(this.currentPage - 1);
  }

  public goToNextCategories(): void {
    const totalPages = this.pagination()?.totalPages ?? 1;
    if (this.currentPage >= totalPages) return;
    this.goToPage(this.currentPage + 1);
  }

  public goToPage(pageNumber: number): void {
    if (pageNumber === this.currentPage) return;

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.isLoading.set(true);
    this.currentPage = pageNumber;
    this.fetchCategories(pageNumber);
  }

  public getSearchValue(value: Event) {
    console.log(value)
  }
}