import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartResponse } from '../../interfaces/cart.interface';

@Injectable({
  providedIn: 'root',
})
export class Cart {
  private http = inject(HttpClient);
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  public addToCart(productId: string, quantity: number) {
    return this.http.post(`${environment.apiBaseUrl}/cart`, { productId, quantity });
  }

  public updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }

  public getCartSummary(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${environment.apiBaseUrl}/cart`);
  }

  public removeFromCart(productId: string) {
    return this.http.delete(`${environment.apiBaseUrl}/cart/${productId}`);
  }
}
