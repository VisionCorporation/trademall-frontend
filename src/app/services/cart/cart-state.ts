import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { Cart } from "./cart";
import { ToastService } from "../toast/toast.service";
import { CartResponse, PriceSnapshot } from "../../interfaces/cart.interface";
import { GuestCart } from "../guest-cart/guest-cart";
import { LoginService } from "../login/login.service";
import { filter, take } from "rxjs";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class CartState {
    private readonly cartService = inject(Cart);
    private readonly guestCartService = inject(GuestCart);
    private readonly toastService = inject(ToastService);
    private readonly loginService = inject(LoginService);
    private readonly destroyRef = inject(DestroyRef);

    public cartQuantities = signal<Record<string, { quantity: number; itemId: string }>>({});
    public cartLoadingStates = signal<Record<string, 'adding' | 'increment' | 'decrement' | null>>({});

    constructor() {
        this.loginService.loginSuccess$
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.mergeGuestCartOnLogin());
    }

    private get isLoggedIn(): boolean {
        return this.loginService.isLoggedIn();
    }

    public initCart(): void {
        this.loginService.sessionLoaded$
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                filter(Boolean),
                take(1)
            )
            .subscribe(() => this.loadCart());
    }

    public isAdding(productId: string): boolean {
        return this.cartLoadingStates()[productId] === 'adding';
    }

    public isIncrementing(productId: string): boolean {
        return this.cartLoadingStates()[productId] === 'increment';
    }

    public isDecrementing(productId: string): boolean {
        return this.cartLoadingStates()[productId] === 'decrement';
    }

    private setLoading(productId: string, state: 'adding' | 'increment' | 'decrement' | null): void {
        this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: state });
    }

    private syncCount(): void {
        const total = this.isLoggedIn
            ? Object.values(this.cartQuantities()).reduce((sum, { quantity }) => sum + quantity, 0)
            : this.guestCartService.getItemCount();
        this.cartService.updateCartCount(total);
    }

    public loadCart(): void {
        if (!this.isLoggedIn) {
            const guestItems = this.guestCartService.getCart().guestCartItems;
            const quantities = guestItems.reduce<Record<string, { quantity: number; itemId: string }>>((acc, item) => {
                acc[item.productId] = { quantity: item.quantity, itemId: '' };
                return acc;
            }, {});
            this.cartQuantities.set(quantities);
            this.syncCount();
            return;
        }

        this.cartService.getCartSummary().subscribe({
            next: (response: CartResponse) => {
                const items = response.data.cart.vendorGroups.flatMap(g => g.items);
                const quantities = items.reduce<Record<string, { quantity: number; itemId: string }>>((acc, item) => {
                    if (item.productId?._id)
                        acc[item.productId._id] = {
                            quantity: (acc[item.productId._id]?.quantity ?? 0) + item.quantity,
                            itemId: item._id
                        };
                    return acc;
                }, {});
                this.cartQuantities.set(quantities);
                this.syncCount();
            },
        });
    }

    public addToCart(productId: string, quantity = 1, priceSnapshot?: PriceSnapshot): void {
        this.setLoading(productId, 'adding');

        if (!this.isLoggedIn) {
            if (!priceSnapshot) {
                this.toastService.error('Missing product info for guest cart');
                this.setLoading(productId, null);
                return;
            }
            this.guestCartService.addItem(productId, quantity, priceSnapshot);
            this.cartQuantities.set({
                ...this.cartQuantities(),
                [productId]: { quantity: this.getCartQuantity(productId) + quantity, itemId: '' }
            });
            this.syncCount();
            this.setLoading(productId, null);
            this.toastService.success('Product added to cart');
            return;
        }

        this.cartService.addToCart(productId, quantity).subscribe({
            next: () => {
                const existing = this.cartQuantities()[productId];
                this.cartQuantities.set({
                    ...this.cartQuantities(),
                    [productId]: {
                        quantity: this.getCartQuantity(productId) + quantity,
                        itemId: existing?.itemId ?? '',
                    }
                });
                this.syncCount();
                this.setLoading(productId, null);
                this.toastService.success('Product added to cart');
                this.loadCart();
            },
            error: (err) => {
                this.toastService.error(`${err.error?.message || 'Failed to add product to cart'}`);
                this.setLoading(productId, null);
            }
        });
    }

    public incrementCartQuantity(productId: string): void {
        const current = this.cartQuantities()[productId];
        const newQty = current.quantity + 1;
        this.setLoading(productId, 'increment');

        if (!this.isLoggedIn) {
            this.guestCartService.updateItemQuantity(productId, newQty);
            this.cartQuantities.set({ ...this.cartQuantities(), [productId]: { ...current, quantity: newQty } });
            this.syncCount();
            this.toastService.success('Product quantity updated');
            this.setLoading(productId, null);
            return;
        }

        this.cartService.updateCartItem(productId, newQty).subscribe({
            next: () => {
                this.cartQuantities.set({ ...this.cartQuantities(), [productId]: { ...current, quantity: newQty } });
                this.syncCount();
                this.toastService.success('Product quantity updated');
                this.setLoading(productId, null);
            },
            error: (err) => {
                this.toastService.error(`${err.error?.message || 'Failed to update quantity'}`);
                this.setLoading(productId, null);
            }
        });
    }

    public decrementCartQuantity(productId: string): void {
        const current = this.cartQuantities()[productId];
        const newQty = current.quantity - 1;

        if (!this.isLoggedIn) {
            this.setLoading(productId, 'decrement');
            if (newQty <= 0) {
                this.guestCartService.removeItem(productId);
                const updated = { ...this.cartQuantities() };
                delete updated[productId];
                this.cartQuantities.set(updated);
                this.toastService.success('Product removed from cart');
            } else {
                this.guestCartService.updateItemQuantity(productId, newQty);
                this.cartQuantities.set({ ...this.cartQuantities(), [productId]: { ...current, quantity: newQty } });
                this.toastService.success('Product quantity updated');
            }
            this.syncCount();
            this.setLoading(productId, null);
            return;
        }

        if (newQty <= 0 && !current.itemId) {
            this.loadCart();
            return;
        }

        this.setLoading(productId, 'decrement');

        if (newQty <= 0) {
            this.cartService.removeFromCart(current.itemId).subscribe({
                next: () => {
                    const updated = { ...this.cartQuantities() };
                    delete updated[productId];
                    this.cartQuantities.set(updated);
                    this.syncCount();
                    this.setLoading(productId, null);
                    this.toastService.success('Product removed from cart');
                },
                error: () => {
                    this.toastService.error('Failed to remove product');
                    this.setLoading(productId, null);
                }
            });
            return;
        }

        this.cartService.updateCartItem(productId, newQty).subscribe({
            next: () => {
                this.cartQuantities.set({ ...this.cartQuantities(), [productId]: { ...current, quantity: newQty } });
                this.syncCount();
                this.toastService.success('Product quantity updated');
                this.setLoading(productId, null);
            },
            error: () => {
                this.toastService.error('Failed to update quantity');
                this.setLoading(productId, null);
            }
        });
    }

    public clearCart(): void {
        if (!this.isLoggedIn) {
            this.guestCartService.clearCart();
            this.cartQuantities.set({});
            this.syncCount();
            this.toastService.success('Cart cleared');
            return;
        }

        this.cartService.clearCart().subscribe({
            next: () => {
                this.cartQuantities.set({});
                this.syncCount();
                this.toastService.success('Cart cleared');
            },
            error: () => this.toastService.error('Failed to clear cart')
        });
    }

    public mergeGuestCartOnLogin(): void {
        if (!this.guestCartService.hasItems()) {
            this.loadCart();
            return;
        }

        const guestCartItems = this.guestCartService.getCart().guestCartItems;
        this.cartService.mergeGuestCart(guestCartItems).subscribe({
            next: () => {
                this.guestCartService.clearCart();
                this.loadCart();
            },
            error: (err) => {
                this.toastService.error(`${err.error?.message || 'Failed to merge guest cart'}`);
            }
        });
    }

    public getCartQuantity(productId: string): number {
        return this.cartQuantities()[productId]?.quantity ?? 0;
    }

    public isProductAddingToCart(productId: string): boolean {
        return this.cartLoadingStates()[productId] != null;
    }
}