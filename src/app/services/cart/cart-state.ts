import { inject, Injectable, signal } from "@angular/core";
import { Cart } from "./cart";
import { ToastService } from "../toast/toast.service";
import { CartResponse } from "../../interfaces/cart.interface";

@Injectable({ providedIn: 'root' })
export class CartState {
    private readonly cartService = inject(Cart);
    private readonly toastService = inject(ToastService);

    public cartQuantities = signal<Record<string, number>>({});
    public cartLoadingStates = signal<Record<string, 'adding' | 'increment' | 'decrement' | null>>({});

    isAdding(productId: string): boolean {
        return this.cartLoadingStates()[productId] === 'adding';
    }

    isIncrementing(productId: string): boolean {
        return this.cartLoadingStates()[productId] === 'increment';
    }

    isDecrementing(productId: string): boolean {
        return this.cartLoadingStates()[productId] === 'decrement';
    }

    loadCart() {
        this.cartService.getCartSummary().subscribe({
            next: (response: CartResponse) => {
                const items = response.data.cart.vendorGroups.flatMap(g => g.items);
                const quantities = items.reduce<Record<string, number>>((acc, item) => {
                    if (item.productId?._id)
                        acc[item.productId._id] = (acc[item.productId._id] ?? 0) + item.quantity;
                    return acc;
                }, {});
                this.cartQuantities.set(quantities);
            },
        });
    }

    addToCart(productId: string, quantity = 1) {
        this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: 'adding' });

        this.cartService.addToCart(productId, quantity).subscribe({
            next: () => {
                this.cartQuantities.set({
                    ...this.cartQuantities(),
                    [productId]: this.getCartQuantity(productId) + quantity,
                });
                this.toastService.success('Product added to cart');
                this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null });
            },
            error: (err) => {
                console.log('Add to cart error:', err);
                this.toastService.error(`${err.error?.message || 'Failed to add product to cart'}`);
                this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null });
            }
        });
    }

    incrementCartQuantity(productId: string) {
        const newQty = this.getCartQuantity(productId) + 1;
        this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: 'increment' });

        this.cartService.updateCartItem(productId, newQty).subscribe({
            next: () => {
                this.cartQuantities.set({ ...this.cartQuantities(), [productId]: newQty });
                this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null });
            },
            error: (err) => {
                this.toastService.error(`${err.error?.message || 'Failed to update quantity'}`);
                this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null });
            }
        });
    }

    decrementCartQuantity(productId: string) {
        const newQty = this.getCartQuantity(productId) - 1;
        this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: 'decrement' }); // ←

        if (newQty <= 0) {
            this.cartService.removeFromCart(productId).subscribe({
                next: () => {
                    const updated = { ...this.cartQuantities() };
                    delete updated[productId];
                    this.cartQuantities.set(updated);
                    this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null }); // ←
                    this.toastService.success('Product removed from cart');
                },
                error: () => {
                    this.toastService.error('Failed to remove product');
                    this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null }); // ←
                }
            });
            return;
        }

        this.cartService.updateCartItem(productId, newQty).subscribe({
            next: () => {
                this.cartQuantities.set({ ...this.cartQuantities(), [productId]: newQty });
                this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null }); // ←
            },
            error: () => {
                this.toastService.error('Failed to update quantity');
                this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null }); // ←
            }
        });
    }

    getCartQuantity(productId: string): number {
        return this.cartQuantities()[productId] ?? 0;
    }

    isProductAddingToCart(productId: string): boolean {
        return this.cartLoadingStates()[productId] != null;
    }
}