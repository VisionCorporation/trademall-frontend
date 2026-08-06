import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';
import { GetAllAddressesResponse, GetDefaultAddressResponse } from '../../interfaces/address.interface';

@Injectable({
  providedIn: 'root',
})
export class Address {
  private http = inject(HttpClient);

  public getDefaultAddress(userId: string): Observable<GetDefaultAddressResponse> {
    return this.http.get<GetDefaultAddressResponse>(`${environment.apiBaseUrl}/address/default/${userId}`);
  }

  public getAllAddresses(userId: string): Observable<GetAllAddressesResponse> {
    return this.http.get<GetAllAddressesResponse>(`${environment.apiBaseUrl}/address/${userId}`);
  }

  public createNewAddress(addressData: any): Observable<Object> {
    return this.http.post<Object>(`${environment.apiBaseUrl}/address`, addressData);
  }

  public updateAddress(addressId: string, addressData: any): Observable<Object> {
    return this.http.put<Object>(`${environment.apiBaseUrl}/address/${addressId}`, addressData);
  }

  public setAsDefaultAddress(addressId: string, userId: string): Observable<Object> {
    return this.http.put<Object>(`${environment.apiBaseUrl}/address/${addressId}/set-default`, { userId });
  }

  public deleteAddress(addressId: string, userId: string): Observable<Object> {
    return this.http.delete<Object>(`${environment.apiBaseUrl}/address/${addressId}`, {
      body: { userId }
    });
  }
}
