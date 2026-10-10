import { inject, Injectable } from '@angular/core';
import { createOrUpdateStoreLocationPayload, createOrUpdateStoreDetailsPayload, StoreResponse, VendorDetailedInfoResponse, CreateOrUpdateStoreDetailsResponse, createOrUpdateStoreLocationResponse } from '../../interfaces/vendor.interface';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VendorProductsResponse } from '../../interfaces/product-card.interface';

@Injectable({
  providedIn: 'root',
})
export class VendorStoreService {
  private http = inject(HttpClient);

  public getStoreWithVendorId(vendorId: string): Observable<StoreResponse> {
    return this.http.get<StoreResponse>(`${environment.apiBaseUrl}/stores/vendor/${vendorId}`)
  }

  public getStoreWithSubdomain(subdomain: string): Observable<StoreResponse> {
    return this.http.get<StoreResponse>(
      `${environment.apiBaseUrl}/stores/${encodeURIComponent(subdomain)}`
    );
  }

  public getVendorProductsById(
    vendorId: string,
    currentPage?: number,
  ): Observable<VendorProductsResponse> {
    return this.http.get<VendorProductsResponse>(
      `${environment.apiBaseUrl}/products/vendor/${vendorId}?page=${currentPage}`,
    );
  }

  public getDetailedVendorInfoForAProduct(productId: string): Observable<VendorDetailedInfoResponse> {
    return this.http.get<VendorDetailedInfoResponse>(
      `${environment.apiBaseUrl}/products/${productId}/vendor`,
    );
  }

  public submitOrUpdateStoreDetails(storeDetails: createOrUpdateStoreDetailsPayload): Observable<CreateOrUpdateStoreDetailsResponse> {
    return this.http.post<CreateOrUpdateStoreDetailsResponse>(`${environment.apiBaseUrl}/stores`, storeDetails);
  }

  public submitStoreLocation(storeLocation: createOrUpdateStoreLocationPayload): Observable<createOrUpdateStoreLocationResponse> {
    return this.http.put<createOrUpdateStoreLocationResponse>(`${environment.apiBaseUrl}/stores/location`, storeLocation);
  }

  public submitStoreLogo(formData: FormData): Observable<Object> {
    return this.http.post<Object>(`${environment.apiBaseUrl}/vendor/store/logo`, formData)
  }

  public submitStoreBanner(formData: FormData): Observable<Object> {
    return this.http.post<Object>(`${environment.apiBaseUrl}/vendor/store/banner`, formData)
  }
}
