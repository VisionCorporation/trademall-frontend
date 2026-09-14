import { ReviewFormData } from "../interfaces/reviews.interface";

export type VoteType = 'helpful' | 'not_helpful';
export type UpdateReviewPayload = Partial<Pick<ReviewFormData, 'rating' | 'title' | 'comment'>>;