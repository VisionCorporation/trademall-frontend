import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class Products {
  private http = inject(HttpClient);

  public getAllCategories() {
    return this.http.get(`${environment.apiBaseUrl}/products/categories`);
  }

  public getAllProducts() {
    return this.http.get(`${environment.apiBaseUrl}/products`);
  }
}
