import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Header } from '../../shared/header/header';
import { fadeInOutAnimation } from '../../animations/toast.animations';
import { Cart as cart } from '../../services/cart/cart';
import { CartResponse, CartItem } from '../../interfaces/cart.interface';
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

  public cartSummary = signal<CartResponse | null>(null);
  public isCartItemsLoading = signal(false);
  public isClearingCart = signal(false);
  public removingFromCartIds = signal(new Set<string>());
  public updatingQuantityIds = signal(new Set<string>());
  public skeletonItems = Array(4);
  public skeletonRows = Array(3);
  public view = signal<'home' | 'cart'>('cart');
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.fetchCartSummary();
  }

  private fetchCartSummary(silent = false) {
    if (!silent) this.isCartItemsLoading.set(true);
    this.cartService.getCartSummary().subscribe({
      next: (data) => {
        this.cartSummary.set(data as CartResponse);
        this.syncHeaderCount();
        if (!silent) this.isCartItemsLoading.set(false);
      },
      error: () => {
        if (!silent) this.isCartItemsLoading.set(false);
      },
    });
  }

  private syncHeaderCount(): void {
    const total =
      this.cartSummary()?.data?.cart?.vendorGroups?.reduce(
        (sum, group) => sum + group.items.reduce((s, i) => s + i.quantity, 0),
        0
      ) ?? 0;
    this.cartService.updateCartCount(total);
  }

  public isUpdatingQuantity(itemId: string): boolean {
    return this.updatingQuantityIds().has(itemId);
  }

  private setUpdating(itemId: string, updating: boolean) {
    const next = new Set(this.updatingQuantityIds());
    updating ? next.add(itemId) : next.delete(itemId);
    this.updatingQuantityIds.set(next);
  }

  private changeQuantity(item: CartItem, newQuantity: number) {
    this.setUpdating(item._id, true);

    this.cartService.updateCartItem(item.productId._id, newQuantity).subscribe({
      next: () => {
        this.patchItemQuantity(item._id, newQuantity);
        this.setUpdating(item._id, false);
        this.syncHeaderCount();
        this.fetchCartSummary(true);
      },
      error: (err) => {
        this.setUpdating(item._id, false);
        this.toastService.error(err.error?.message || 'Failed to update quantity.');
      },
    });
  }

  private patchItemQuantity(itemId: string, newQuantity: number) {
    const current = this.cartSummary();
    if (!current) return;

    const updated: CartResponse = {
      ...current,
      data: {
        ...current.data,
        cart: {
          ...current.data.cart,
          vendorGroups: current.data.cart.vendorGroups.map((group) => {
            if (!group.items.some((i) => i._id === itemId)) return group;

            const items = group.items.map((i) =>
              i._id === itemId
                ? { ...i, quantity: newQuantity, lineTotal: i.price * newQuantity }
                : i
            );

            return {
              ...group,
              items,
              subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
            };
          }),
        },
      },
    };

    this.cartSummary.set(updated);
  }

  public incrementQuantity(item: CartItem) {
    this.changeQuantity(item, item.quantity + 1);
  }

  public decrementQuantity(item: CartItem) {
    if (item.quantity <= 1) return;
    this.changeQuantity(item, item.quantity - 1);
  }

  public isRemoving(itemId: string): boolean {
    return this.removingFromCartIds().has(itemId);
  }

  private setRemoving(itemId: string, removing: boolean) {
    const next = new Set(this.removingFromCartIds());
    removing ? next.add(itemId) : next.delete(itemId);
    this.removingFromCartIds.set(next);
  }

  public removeFromCart(itemId: string) {
    this.setRemoving(itemId, true);

    this.cartService.removeFromCart(itemId).subscribe({
      next: () => {
        this.toastService.success('Product removed from cart successfully.');
        this.removeItemLocally(itemId);
        this.setRemoving(itemId, false);
        this.syncHeaderCount();
        this.fetchCartSummary(true); 
      },
      error: () => {
        this.toastService.error('Failed to remove product from cart. Please try again.');
        this.setRemoving(itemId, false);
      },
    });
  }

  private removeItemLocally(itemId: string): void {
    const current = this.cartSummary();
    if (!current) return;

    const vendorGroups = current.data.cart.vendorGroups
      .map((group) => {
        const items = group.items.filter((i) => i._id !== itemId);
        return {
          ...group,
          items,
          subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
        };
      })
      .filter((group) => group.items.length > 0); 

    const itemCount = vendorGroups.reduce((sum, g) => sum + g.items.length, 0);

    this.cartSummary.set({
      ...current,
      data: {
        ...current.data,
        cart: {
          ...current.data.cart,
          vendorGroups,
          itemCount,
          items: itemCount,
          isEmpty: itemCount === 0,
        },
      },
    });
  }

  public clearCart() {
    const summary = this.cartSummary();
    if (!summary || summary.data.cart.vendorGroups.length === 0) {
      this.toastService.error('Your cart is already empty.');
      return;
    }

    this.isClearingCart.set(true);
    this.cartService.clearCart().subscribe({
      next: () => {
        this.toastService.success('Cart cleared successfully.');
        this.clearCartLocally();
        this.isClearingCart.set(false);
        this.syncHeaderCount();
        this.fetchCartSummary(true); 
      },
      error: () => {
        this.toastService.error('Failed to clear cart. Please try again.');
        this.isClearingCart.set(false);
      },
    });
  }

  private clearCartLocally(): void {
    const current = this.cartSummary();
    if (!current) return;

    this.cartSummary.set({
      ...current,
      data: {
        ...current.data,
        cart: {
          ...current.data.cart,
          vendorGroups: [],
          itemCount: 0,
          items: 0,
          isEmpty: true,
        },
      },
    });
  }

  public goToHome() {
    this.view.set('home');
    this.router.navigate(['/']);
  }
}