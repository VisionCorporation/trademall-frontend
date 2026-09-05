import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';
import {
  RootCategoryResponse,
  CategoryListResponse,
} from '../../interfaces/categories.interface';
import { AllProductsResponse, CategoryProductsResponse, FeaturedProductsResponse } from '../../interfaces/product-card.interface';

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

  public getSubCategories(
    categorySlug: string,
  ): Observable<CategoryListResponse> {
    return this.http.get<CategoryListResponse>(
      `${environment.apiBaseUrl}/products/categories/${categorySlug}/subcategories`,
    );
  }

  public getProductsByCategory(categorySlug: string): Observable<CategoryProductsResponse> {
    return this.http.get<CategoryProductsResponse>(`${environment.apiBaseUrl}/products/category/${categorySlug}/`);
  }

  public getProductBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/products/${slug}/`);
  }

  public getFeaturedProducts(): Observable<FeaturedProductsResponse> {
    return this.http.get<FeaturedProductsResponse>(`${environment.apiBaseUrl}/products/featured`);
  }

  public getAllProducts(currentPage: number, category?: string[]): Observable<AllProductsResponse> {
    let params = new HttpParams().set('page', currentPage);

    if (category?.length) {
      params = params.set('category', category.join(','));
    }

    return this.http.get<AllProductsResponse>(`${environment.apiBaseUrl}/products`, { params });
  }

  public searchProduct(
    query: string,
    currentPage: number,
    category?: string[]
  ): Observable<AllProductsResponse> {
    let params = new HttpParams()
      .set('q', query)
      .set('page', currentPage);

    if (category?.length) {
      params = params.set('category', category.join(','));
    }

    return this.http.get<AllProductsResponse>(
      `${environment.apiBaseUrl}/products/search`,
      { params }
    );
  }
}