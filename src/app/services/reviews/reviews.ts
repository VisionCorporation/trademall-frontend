import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';
import { Review, ReviewFormData, ReviewsResponse, VoteOnReviewResponse } from '../../interfaces/reviews.interface';
import { VoteType } from '../../types/product-details.type';

@Injectable({
  providedIn: 'root',
})
export class Reviews {
  private http = inject(HttpClient);

  public getReviewsForAProduct(productId: string, page = 1): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(
      `${environment.apiBaseUrl}/reviews/products/${productId}?page=${page}`
    );
  }

  public createReview(reviewData: ReviewFormData): Observable<{ status: string; data: Review }> {
    return this.http.post<{ status: string; data: Review }>(
      `${environment.apiBaseUrl}/reviews`,
      reviewData
    );
  }

  public voteOnReview(reviewId: string, voteType: VoteType): Observable<VoteOnReviewResponse> {
    return this.http.post<VoteOnReviewResponse>(
      `${environment.apiBaseUrl}/reviews/${reviewId}/helpful`,
      { voteType }
    );
  }
}
