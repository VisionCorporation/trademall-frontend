import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Reviews {
  private http = inject(HttpClient);

  public getReviewsForAProduct(productId: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/products/${productId}/reviews`);
  }
}
