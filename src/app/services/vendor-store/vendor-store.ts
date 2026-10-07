import { inject, Injectable } from '@angular/core';
import { createOrUpdateStoreLocationPayload, createOrUpdateStoreDetailsPayload, StoreResponse, VendorDetailedInfoResponse, CreateOrUpdateStoreDetailsResponse, createOrUpdateStoreLocationResponse } from '../../interfaces/vendor.interface';
import { environment } from '../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VendorProductsResponse } from '../../interfaces/product-card.interface';

@Injectable({
  providedIn: 'root',
})
export class VendorStoreService {
  private http = inject(HttpClient);

  public getPublicStorePage(subdomain: string): Observable<StoreResponse> {
    return this.http.get<StoreResponse>(`${environment.apiBaseUrl}/stores/${subdomain}`)
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
}
