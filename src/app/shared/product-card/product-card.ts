import { Component, inject, Input } from '@angular/core';
import { CartState } from '../../services/cart/cart-state';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Wishlist } from '../../services/wishlist/wishlist';
import { ProductCardInterface, ProductDetails } from '../../interfaces/products.interface';
import { Product } from '../../interfaces/all-products.interface';
import { PriceSnapshot } from '../../interfaces/cart.interface';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product!: ProductCardInterface | FeaturedProduct | ProductDetails | Product
  @Input() layout: 'grid' | 'carousel' = 'grid';
  public cartStateService = inject(CartState);
  public wishlistService = inject(Wishlist)

  public get priceSnapshot(): PriceSnapshot {
    const salePrice = (this.product as any).salePrice ?? null;
    return {
      productName: this.product.name,
      price: this.product.price,
      salePrice,
      effectivePrice: salePrice ?? this.product.price,
    };
  }

  public addToCart(): void {
    this.cartStateService.addToCart(this.product._id, 1, this.priceSnapshot);
  }
}