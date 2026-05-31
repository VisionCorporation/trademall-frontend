import { inject, Injectable, signal } from "@angular/core";
import { Cart } from "./cart";
import { ToastService } from "../toast/toast.service";
import { CartResponse } from "../../interfaces/cart.interface";

@Injectable({ providedIn: 'root' })
export class CartState {
    private readonly cartService = inject(Cart);
    private readonly toastService = inject(ToastService);
    public cartQuantities = signal<Record<string, { quantity: number; itemId: string }>>({});
    public cartLoadingStates = signal<Record<string, 'adding' | 'increment' | 'decrement' | null>>({});

    public isAdding(productId: string): boolean {
        return this.cartLoadingStates()[productId] === 'adding';
    }

    public isIncrementing(productId: string): boolean {
        return this.cartLoadingStates()[productId] === 'increment';
    }

    public isDecrementing(productId: string): boolean {
        return this.cartLoadingStates()[productId] === 'decrement';
    }

    private syncCount(): void {
        const total = Object.values(this.cartQuantities()).reduce((sum, { quantity }) => sum + quantity, 0);
        this.cartService.updateCartCount(total);
    }

    public loadCart() {
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

    public addToCart(productId: string, quantity = 1) {
        this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: 'adding' });

        this.cartService.addToCart(productId, quantity).subscribe({
            next: () => {
                this.cartQuantities.set({
                    ...this.cartQuantities(),
                    [productId]: {
                        quantity: this.getCartQuantity(productId) + quantity,
                        itemId: ''
                    }
                });
                this.syncCount();
                this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null });
                this.toastService.success('Product added to cart');
                this.loadCart();
            },
            error: (err) => {
                this.toastService.error(`${err.error?.message || 'Failed to add product to cart'}`);
                this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null });
            }
        });
    }

    public incrementCartQuantity(productId: string) {
        const current = this.cartQuantities()[productId];
        const newQty = current.quantity + 1;
        this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: 'increment' });

        this.cartService.updateCartItem(productId, newQty).subscribe({
            next: () => {
                this.cartQuantities.set({
                    ...this.cartQuantities(),
                    [productId]: { ...current, quantity: newQty }
                });
                this.syncCount();
                this.toastService.success('Product quantity updated');
                this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null });
            },
            error: (err) => {
                this.toastService.error(`${err.error?.message || 'Failed to update quantity'}`);
                this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null });
            }
        });
    }

    public decrementCartQuantity(productId: string) {
        const current = this.cartQuantities()[productId];
        const newQty = current.quantity - 1;
        this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: 'decrement' });

        if (newQty <= 0) {
            this.cartService.removeFromCart(current.itemId).subscribe({
                next: () => {
                    const updated = { ...this.cartQuantities() };
                    delete updated[productId];
                    this.cartQuantities.set(updated);
                    this.syncCount();
                    this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null });
                    this.toastService.success('Product removed from cart');
                },
                error: (err) => {
                    this.toastService.error('Failed to remove product');
                    this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null });
                }
            });
            return;
        }

        this.cartService.updateCartItem(productId, newQty).subscribe({
            next: () => {
                this.cartQuantities.set({
                    ...this.cartQuantities(),
                    [productId]: { ...current, quantity: newQty }
                });
                this.syncCount();
                this.toastService.success('Product quantity updated');
                this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null });
            },
            error: () => {
                this.toastService.error('Failed to update quantity');
                this.cartLoadingStates.set({ ...this.cartLoadingStates(), [productId]: null });
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