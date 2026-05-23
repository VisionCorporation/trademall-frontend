import { Component, inject, signal } from '@angular/core';
import { Header } from '../../shared/header/header';
import { RouterLink } from '@angular/router';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { Footer } from '../../shared/footer/footer';
import { FeaturedCategories } from '../../shared/featured-categories/featured-categories';
import { Products } from '../../services/products/products';
import { ToastService } from '../../services/toast/toast.service';
import { CurrencyPipe } from '@angular/common';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { COMMONQUESTIONS } from '../../data/constants/common-questions.constant';
import { slideDown } from '../../animations/expand.animation';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { CartState } from '../../services/cart/cart-state';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [
    Header,
    RouterLink,
    Newsletter,
    Footer,
    FeaturedCategories,
    SkeletonLoader,
    ProductCard
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  animations: [staggerProducts, slideDown, fadeInOutAnimation],
})
export class Home {
  private readonly productsService = inject(Products);
  private readonly toastService = inject(ToastService);
  public featuredProducts: FeaturedProduct[] = [];
  public wishlistedIds = new Set<string>();
  public isFeaturedProductsLoading = signal(false);
  public readonly commonQuestions = COMMONQUESTIONS;
  public openQuestion: string | null = null;
  public addingToCartIds = new Set<string>();
  public cartQuantities = signal<Record<string, number>>({});
  private readonly cartState = inject(CartState);

  ngOnInit() {
    this.isFeaturedProductsLoading.set(true);

    this.cartState.loadCart();

    this.productsService.getFeaturedProducts().subscribe({
      next: (response) => {
        this.featuredProducts = response.data;
        this.isFeaturedProductsLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load featured products');
        this.isFeaturedProductsLoading.set(false);
      },
    });
  }

  public toggleQuestion(question: string) {
    this.openQuestion = this.openQuestion === question ? null : question;
  }
}
