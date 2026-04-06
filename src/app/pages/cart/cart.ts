import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../shared/header/header';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { Cart as cart } from '../../services/cart/cart';
import { CartResponse } from '../../interfaces/cart.interface';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ToastService } from '../../services/toast/toast.service';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, Header, CurrencyPipe, NgOptimizedImage, SkeletonLoader],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  animations: [fadeInOutAnimation],
})
export class Cart implements OnInit {
  private readonly cartService = inject(cart);
  private readonly toastService = inject(ToastService);
  public cartSummary: CartResponse | null = null;
  public isCartItemsLoading = signal(false);
  public removingFromCartIds = new Set<string>();
  public skeletonItems = Array(4);
  public skeletonRows = Array(3);

  ngOnInit(): void {
    this.fetchCartSummary();
  }

  private fetchCartSummary() {
    this.isCartItemsLoading.set(true);
    this.cartService.getCartSummary().subscribe({
      next: (data) => {
        this.cartSummary = data as CartResponse;
        this.isCartItemsLoading.set(false);
      },
      error: () => {
        this.isCartItemsLoading.set(false);
      },
    });
  }

  public isRemoving(itemId: string): boolean {
    return this.removingFromCartIds.has(itemId);
  }

  public removeFromCart(itemId: string) {
    this.removingFromCartIds.add(itemId);
    this.cartService.removeFromCart(itemId).subscribe({
      next: () => {
        this.toastService.success('Product removed from cart successfully.');
        this.fetchCartSummary();
        this.removingFromCartIds.delete(itemId);
      },
      error: () => {
        this.toastService.error('Failed to remove product from cart. Please try again.');
        this.removingFromCartIds.delete(itemId);
      },
    });
  }
}
