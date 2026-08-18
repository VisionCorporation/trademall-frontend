import { inject, Injectable } from '@angular/core';
import { VendorProductsResponse } from '../../interfaces/vendor.interface';
import { environment } from '../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VendorStore {
  private http = inject(HttpClient);

  public getVendorProductsById(
    vendorId: string,
    currentPage?: number,
  ): Observable<VendorProductsResponse> {
    return this.http.get<VendorProductsResponse>(
      `${environment.apiBaseUrl}/products/vendor/${vendorId}?page=${currentPage}`,
    );
  }
}
