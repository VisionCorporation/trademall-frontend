import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';
import {
  RootCategoryResponse,
  SelectedCategoryDetailResponse,
} from '../../interfaces/categories.interface';
import { VendorProductsResponse } from '../../interfaces/vendor.interface';

@Injectable({
  providedIn: 'root',
})
export class Products {
  private http = inject(HttpClient);

  public getRootCategories(currentPage = 1): Observable<RootCategoryResponse> {
    return this.http.get<RootCategoryResponse>(
      `${environment.apiBaseUrl}/products/categories/root?page=${currentPage}`,
    );
  }

  public getCategoryWithDirectChildren(
    categorySlug: string,
  ): Observable<SelectedCategoryDetailResponse> {
    return this.http.get<SelectedCategoryDetailResponse>(
      `${environment.apiBaseUrl}/products/categories/${categorySlug}/with-children`,
    );
  }

  public getProductsByCategory(categorySlug: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/products/category/${categorySlug}/`);
  }

  public getProductBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/products/${slug}/`);
  }

  public getVendorProductsById(
    vendorId: string,
    currentPage?: number,
  ): Observable<VendorProductsResponse> {
    return this.http.get<VendorProductsResponse>(
      `${environment.apiBaseUrl}/products/vendor/${vendorId}?page=${currentPage}`,
    );
  }

  public getFeaturedProducts(): Observable<FeaturedProductsResponse> {
    return this.http.get<FeaturedProductsResponse>(`${environment.apiBaseUrl}/products/featured`);
  }
}
