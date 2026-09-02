import { inject, Injectable } from '@angular/core';
import { StoreResponse } from '../../interfaces/vendor.interface';
import { environment } from '../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VendorProductsResponse } from '../../interfaces/product-card.interface';

@Injectable({
  providedIn: 'root',
})
export class VendorStore {
  private http = inject(HttpClient);

  public getPublicStorePage(subdoamin: string): Observable<StoreResponse> {
    return this.http.get<StoreResponse>(`${environment.apiBaseUrl}/stores/${subdoamin}`)
  }

  public getVendorProductsById(
    vendorId: string,
    currentPage?: number,
  ): Observable<VendorProductsResponse> {
    return this.http.get<VendorProductsResponse>(
      `${environment.apiBaseUrl}/products/vendor/${vendorId}?page=${currentPage}`,
    );
  }
}
