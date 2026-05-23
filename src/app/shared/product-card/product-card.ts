import { Component, inject, Input } from '@angular/core';
import { CartState } from '../../services/cart/cart-state';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Wishlist } from '../../services/wishlist/wishlist';
import { ProductCardInterface } from '../../interfaces/products.interface';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product!: ProductCardInterface | FeaturedProduct

  public cartStateService = inject(CartState);
  public wishlistService = inject(Wishlist)
}
