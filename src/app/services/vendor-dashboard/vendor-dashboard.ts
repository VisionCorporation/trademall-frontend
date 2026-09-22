import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { DeleteProductResponse, ProductsResponse, VariantPayload, VariationPayload } from '../../interfaces/vendor-dashboard.interface';
import { CreateProductResponse, ProductGeneralDetailsPayload, UploadImagesResponse } from '../../interfaces/products.interface';

@Injectable({
  providedIn: 'root',
})
export class VendorDashboard {
  private http = inject(HttpClient);

  public getVendorProductListings(page: number = 1, limit: number = 20, status: string = 'all'): Observable<ProductsResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (status !== 'all') {
      params = params.set('status', status);
    }

    return this.http.get<ProductsResponse>(`${environment.apiBaseUrl}/products/my/listings`, { params });
  }

  public deleteProduct(productId: string): Observable<DeleteProductResponse> {
    return this.http.delete<DeleteProductResponse>(`${environment.apiBaseUrl}/products/${productId}`);
  }

  public submitProductGeneralDetails(payload: ProductGeneralDetailsPayload): Observable<CreateProductResponse> {
    return this.http.post<CreateProductResponse>(`${environment.apiBaseUrl}/products`, payload)
  }

  public submitProductImages(productId: string, formData: FormData): Observable<UploadImagesResponse> {
    return this.http.post<UploadImagesResponse>(`${environment.apiBaseUrl}/products/${productId}/images`, formData)
  }

  public submitProductVariations(productId: string, variations: VariationPayload[]) {
    return this.http.post<{ variations: VariationPayload[] }>(
      `${environment.apiBaseUrl}/products/${productId}/variations`,
      { variations }
    );
  }

  public submitProductVariants(productId: string, variants: VariantPayload[]) {
    return this.http.post<{ variants: VariantPayload[] }>(
      `${environment.apiBaseUrl}/products/${productId}/variants`,
      { variants }
    );
  }

  public submitProductAdvancedDetails(productId: string, payload: any) {
    return this.http.put<{ message: string; data: any }>(
      `${environment.apiBaseUrl}/products/${productId}`,
      payload
    );
  }
}
