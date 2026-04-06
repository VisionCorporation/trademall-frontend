import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Cart {
  private http = inject(HttpClient);

  public addToCart(productId: string, quantity: number) {
    return this.http.post(`${environment.apiBaseUrl}/cart`, { productId, quantity });
  }

  public getCartSummary() {
    return this.http.get(`${environment.apiBaseUrl}/cart`);
  }

  public removeFromCart(productId: string) {
    return this.http.delete(`${environment.apiBaseUrl}/cart/${productId}`);
  }
}
