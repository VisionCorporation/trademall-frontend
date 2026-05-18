import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ProductsResponse } from '../../interfaces/vendor-dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class VendorDashboard {
  private http = inject(HttpClient);

  public getVendorProductListings(): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${environment.apiBaseUrl}/products/my/listings`);
  }
}
