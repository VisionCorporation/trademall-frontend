import { Component, inject, signal } from '@angular/core';
import { Header } from '../../shared/header/header';
import { RouterLink } from '@angular/router';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { Footer } from '../../shared/footer/footer';
import { FeaturedCategories } from '../../shared/featured-categories/featured-categories';
import { Products } from '../../services/products/products';
import { ToastService } from '../../services/toast/toast.service';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { COMMONQUESTIONS } from '../../data/constants/common-questions.constant';
import { slideDown } from '../../animations/expand.animation';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { CartState } from '../../services/cart/cart-state';
import { ProductCard } from '../../shared/product-card/product-card';
import { HeroCarousel } from '../hero-carousel/hero-carousel';
import { NgOptimizedImage } from '@angular/common';
import { Seo } from '../../services/seo/seo';
import { ProductCardInterface } from '../../interfaces/product-card.interface';
import { MARQUEE_ITEMS } from '../../data/constants/home.constant';

@Component({
  selector: 'app-home',
  imports: [
    Header,
    RouterLink,
    Newsletter,
    Footer,
    FeaturedCategories,
    SkeletonLoader,
    ProductCard, HeroCarousel, NgOptimizedImage
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  animations: [staggerProducts, slideDown, fadeInOutAnimation],
})
export class Home {
  private readonly productsService = inject(Products);
  private readonly toastService = inject(ToastService);
  private readonly seoService = inject(Seo);
  public featuredProducts: ProductCardInterface[] = [];
  public wishlistedIds = new Set<string>();
  public isFeaturedProductsLoading = signal(false);
  public readonly commonQuestions = COMMONQUESTIONS;
  public openQuestion: string | null = null;
  public addingToCartIds = new Set<string>();
  public cartQuantities = signal<Record<string, number>>({});
  private readonly cartState = inject(CartState);
  public hasFeaturedProductFailed = signal(false);
  public items: string[] = MARQUEE_ITEMS;
  public repeat = 2;

  constructor() {
    this.seoService.updatePageSeo({
      title: 'TradeMall | Shop Products from Trusted Sellers',
      description: 'Shop a wide range of products from trusted sellers on TradeMall. Discover great products, compare options, and enjoy a convenient online shopping experience.',
      url: 'https://trademall-frontend.vercel.app/',
      image: 'https://trademall-frontend.vercel.app/assets/images/og-home.jpeg',
    });
  }

  ngOnInit() {
    this.isFeaturedProductsLoading.set(true);
    this.cartState.initCart()
    this.fetchFeaturedProducts();
  }

  public fetchFeaturedProducts() {
    this.productsService.getFeaturedProducts().subscribe({
      next: (response) => {
        this.featuredProducts = response.data;
        this.isFeaturedProductsLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load featured products');
        this.isFeaturedProductsLoading.set(false);
        this.hasFeaturedProductFailed.set(true);
      },
    });
  }

  public toggleQuestion(question: string) {
    this.openQuestion = this.openQuestion === question ? null : question;
  }

  public get expandedItems(): string[] {
    return Array.from({ length: this.repeat }, () => this.items).flat();
  }
}
