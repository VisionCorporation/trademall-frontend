import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { CartItem, GuestCartItem, GuestCartStorage, PriceSnapshot, GuestCartDisplayInfo, CartResponse } from "../../interfaces/cart.interface";

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

    public addItem(productId: string, quantity: number, priceSnapshot: PriceSnapshot, displayInfo: GuestCartDisplayInfo): GuestCartStorage {
        const cart = this.readCart();
        const existing = cart.guestCartItems.find(i => i.productId === productId);

        if (existing) {
            existing.quantity += quantity;
            existing.priceSnapshot = priceSnapshot;
            existing.displayInfo = displayInfo;
        } else {
            cart.guestCartItems.push({ productId, quantity, priceSnapshot, displayInfo });
        }

        this.writeCart(cart);
        return cart;
    }

    public toCartResponse(): CartResponse {
        const items = this.readCart().guestCartItems;

        const groupsByVendor = new Map<string, CartItem[]>();

        for (const item of items) {
            const lineTotal = item.priceSnapshot.effectivePrice * item.quantity;

            const cartItem = {
                _id: item.productId,
                productId: { _id: item.productId },
                productName: item.priceSnapshot.productName,
                productImage: item.displayInfo.productImage,
                price: item.priceSnapshot.effectivePrice,
                quantity: item.quantity,
                lineTotal,
            } as CartItem;

            const group = groupsByVendor.get(item.displayInfo.vendorId) ?? [];
            group.push(cartItem);
            groupsByVendor.set(item.displayInfo.vendorId, group);
        }

        const vendorGroups = Array.from(groupsByVendor.entries()).map(([vendorId, groupItems]) => ({
            vendorId,
            businessName: items.find(i => i.displayInfo.vendorId === vendorId)?.displayInfo.businessName ?? '',
            items: groupItems,
            subtotal: groupItems.reduce((sum, i) => sum + i.lineTotal, 0),
        }));

        const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

        return {
            success: true,
            message: '',
            data: {
                cart: {
                    vendorGroups,
                    itemCount,
                    items: itemCount,
                    isEmpty: items.length === 0,
                },
            },
        } as unknown as CartResponse;
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
        if (this.readCart().guestCartItems.length === 1) {
            this.clearCart()
        } else {
            this.writeCart(cart);
        }

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