import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ProductsResponse } from '../../interfaces/vendor-dashboard.interface';
import { CreateProductResponse, ProductGeneralDetailsPayload, UploadImagesResponse } from '../../interfaces/products.interface';

@Injectable({
  providedIn: 'root',
})
export class VendorDashboard {
  private http = inject(HttpClient);

  public getVendorProductListings(): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${environment.apiBaseUrl}/products/my/listings`);
  }

  public submitProductGeneralDetails(payload: ProductGeneralDetailsPayload): Observable<CreateProductResponse> {
    return this.http.post<CreateProductResponse>(`${environment.apiBaseUrl}/products`, payload)
  }

  public submitProductImages(productId: string, formData: FormData): Observable<UploadImagesResponse> {
    return this.http.post<UploadImagesResponse>(`${environment.apiBaseUrl}/products/${productId}/images`, formData)
  }
}
