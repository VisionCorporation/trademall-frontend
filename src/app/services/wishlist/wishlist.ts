import { Component, inject, Injectable } from '@angular/core';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-wishlist',
  imports: [],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})

@Injectable({ providedIn: 'root' })
export class Wishlist {
private readonly toastService = inject(ToastService);
  public wishlistedIds = new Set<string>();

  toggle(productId: string, productName = ''): void {
    if (this.wishlistedIds.has(productId)) {
      this.wishlistedIds.delete(productId);
      this.toastService.success(`${productName} removed from wishlist`);
    } else {
      this.wishlistedIds.add(productId);
      this.toastService.success(`${productName} added to wishlist`);
    }
  }

  has(productId: string): boolean {
    return this.wishlistedIds.has(productId);
  }
}
