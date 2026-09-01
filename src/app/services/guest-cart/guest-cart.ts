import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { GuestCartItem, GuestCartStorage, PriceSnapshot } from "../../interfaces/cart.interface";

@Injectable({ providedIn: 'root' })
export class GuestCart {
    public GUEST_CART_KEY = 'guestCart';
    private readonly platformId = inject(PLATFORM_ID);
    private readonly isBrowser = isPlatformBrowser(this.platformId);

    private readCart(): GuestCartStorage {
        if (!this.isBrowser) return { guestCartItems: [] };

        try {
            const raw = localStorage.getItem(this.GUEST_CART_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed?.guestCartItems ? parsed : { guestCartItems: [] };
        } catch {
            return { guestCartItems: [] };
        }
    }

    private writeCart(cart: GuestCartStorage): void {
        if (!this.isBrowser) return;
        localStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(cart));
    }

    public getCart(): GuestCartStorage {
        return this.readCart();
    }

    public getItem(productId: string): GuestCartItem | undefined {
        return this.readCart().guestCartItems.find(i => i.productId === productId);
    }

    public addItem(productId: string, quantity: number, priceSnapshot: PriceSnapshot): GuestCartStorage {
        const cart = this.readCart();
        const existing = cart.guestCartItems.find(i => i.productId === productId);

        if (existing) {
            existing.quantity += quantity;
            existing.priceSnapshot = priceSnapshot;
        } else {
            cart.guestCartItems.push({ productId, quantity, priceSnapshot });
        }

        this.writeCart(cart);
        return cart;
    }

    public updateItemQuantity(productId: string, quantity: number): GuestCartStorage {
        const cart = this.readCart();
        const item = cart.guestCartItems.find(i => i.productId === productId);
        if (item) item.quantity = quantity;
        this.writeCart(cart);
        return cart;
    }

    public removeItem(productId: string): GuestCartStorage {
        const cart = this.readCart();
        cart.guestCartItems = cart.guestCartItems.filter(i => i.productId !== productId);
        this.writeCart(cart);
        return cart;
    }

    public clearCart(): void {
        if (!this.isBrowser) return;
        localStorage.removeItem(this.GUEST_CART_KEY);
    }

    public getItemCount(): number {
        return this.readCart().guestCartItems.reduce((sum, i) => sum + i.quantity, 0);
    }

    public hasItems(): boolean {
        return this.readCart().guestCartItems.length > 0;
    }
}