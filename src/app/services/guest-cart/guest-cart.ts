import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { CartItem, GuestCartItem, GuestCartStorage, PriceSnapshot, GuestCartDisplayInfo, CartResponse } from "../../interfaces/cart.interface";

@Injectable({ providedIn: 'root' })
export class GuestCart {
    public GUEST_CART_KEY = 'guestCart';
    private readonly platformId = inject(PLATFORM_ID);
    public readonly isBrowser = isPlatformBrowser(this.platformId);

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

        const normalizeVendorId = (vendorId: unknown): string =>
            typeof vendorId === 'string' ? vendorId : (vendorId as { _id: string })?._id ?? '';

        const groupsByVendor = new Map<string, CartItem[]>();
        const vendorNames = new Map<string, string>();

        for (const item of items) {
            const vendorId = normalizeVendorId(item.displayInfo.vendorId);
            const lineTotal = item.priceSnapshot.effectivePrice * item.quantity;

            const cartItem = {
                _id: item.productId,
                productId: { _id: item.productId, name: item.priceSnapshot.productName },
                productName: item.priceSnapshot.productName,
                productImage: item.displayInfo.productImage,
                quantity: item.quantity,
                price: item.priceSnapshot.effectivePrice,
                lineTotal,
                isPreOrder: false,
                priceChanged: false,
                isAvailable: true,
                unavailabilityReason: null,
            } as CartItem;

            const group = groupsByVendor.get(vendorId) ?? [];
            group.push(cartItem);
            groupsByVendor.set(vendorId, group);

            if (!vendorNames.has(vendorId)) {
                vendorNames.set(vendorId, item.displayInfo.businessName ?? '');
            }
        }

        const vendorGroups = Array.from(groupsByVendor.entries()).map(([vendorId, groupItems]) => ({
            vendorId,
            businessName: vendorNames.get(vendorId) ?? '',
            items: groupItems,
            subtotal: groupItems.reduce((sum, i) => sum + i.lineTotal, 0),
        }));

        const itemCount = items.length;

        return {
            status: 'success',
            data: {
                cart: {
                    items: itemCount,
                    vendorGroups,
                    itemCount,
                    unavailableItemCount: 0,
                    hasPriceChanges: false,
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