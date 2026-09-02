import { Component, inject, Input } from '@angular/core';
import { CartState } from '../../services/cart/cart-state';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Wishlist } from '../../services/wishlist/wishlist';
// import { ProductCardInterface, ProductDetails } from '../../interfaces/products.interface';
// import { Product } from '../../interfaces/all-products.interface';
import { GuestCartDisplayInfo, PriceSnapshot } from '../../interfaces/cart.interface';
import { ProductCardInterface } from '../../interfaces/product-card.interface';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe, DecimalPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product!: ProductCardInterface
  @Input() layout: 'grid' | 'carousel' = 'grid';
  public cartStateService = inject(CartState);
  public wishlistService = inject(Wishlist)
  public readonly starIndices = [0, 1, 2, 3, 4];
  public readonly starGradientUid = Math.random().toString(36).slice(2, 9);

  public get priceSnapshot(): PriceSnapshot {
    const salePrice = (this.product as any).salePrice ?? null;
    return {
      productName: this.product.name,
      price: this.product.price,
      salePrice,
      effectivePrice: salePrice ?? this.product.price,
    };
  }

  public get displayInfo(): GuestCartDisplayInfo {
    return {
      productImage: this.product.images?.[0]?.url ?? '',
      vendorId: (this.product as any).vendor ?? '',
      businessName: this.product.store?.name ?? '',
    };
  }

  public addToCart(): void {
    this.cartStateService.addToCart(this.product.id, 1, this.priceSnapshot, this.displayInfo);
  }

  public starFillPercent(index: number, rating: number): number {
    const diff = rating - index;
    return Math.round(Math.min(Math.max(diff, 0), 1) * 100);
  }

  public availabilityLabel(status: ProductCardInterface['availability']): string {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'out_of_stock': return 'Out of Stock';
      case 'pre_order': return 'Pre-Order';
    }
  }

  public availabilityClass(status: ProductCardInterface['availability']): string {
    switch (status) {
      case 'in_stock': return 'bg-[#00a751] text-white';
      case 'out_of_stock': return 'bg-[#DC2626] text-white';
      case 'pre_order': return 'bg-[#F59E0B] text-white';
    }
  }
}