export interface ReviewFormData {
    orderId: string;
    productId: string;
    rating: number;
    title: string;
    comment: string;
}

export interface ReviewUser {
    _id: string;
    firstName: string;
    lastName: string;
}

export interface Review {
    _id: string;
    userId: ReviewUser;
    rating: number;
    title: string;
    comment: string;
    isVerified: boolean;
    helpful: number;
    notHelpful: number;
    createdAt: string;
}

export interface ReviewsPagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface ReviewsResponse {
    status: string;
    data: {
        reviews: Review[];
        pagination: ReviewsPagination;
    };
}

export interface VoteOnReviewResponse {
    status: string;
    message: string;
    data: VoteOnReviewData
}

interface VoteOnReviewData {
    helpful: number;
    notHelpful: number
}