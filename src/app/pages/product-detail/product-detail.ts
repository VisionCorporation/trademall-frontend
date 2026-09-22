import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Products } from '../../services/products/products';
import { ProductDetails } from '../../interfaces/products.interface';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ToastService } from '../../services/toast/toast.service';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { Breadcrumb } from '../../shared/breadcrumb/breadcrumb';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { Newsletter } from '../../shared/newsletter/newsletter';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { buttons } from '../../data/constants/product-details.constant';
import { Reviews } from '../../services/reviews/reviews';
import { VendorStore } from '../../services/vendor-store/vendor-store';
import { Seo } from '../../services/seo/seo';
import { ProductCard } from '../../shared/product-card/product-card';
import { ProductCardInterface } from '../../interfaces/product-card.interface';
import { GuestCartDisplayInfo, PriceSnapshot } from '../../interfaces/cart.interface';
import { CartState } from '../../services/cart/cart-state';
import { VendorDetailedInfoResponse } from '../../interfaces/vendor.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Review, ReviewFormData, ReviewsPagination } from '../../interfaces/reviews.interface';
import { finalize } from 'rxjs';
import { VoteType } from '../../types/product-details.type';
import { LoginService } from '../../services/login/login.service';
import { ConfirmDialogService } from '../../services/confirm-dialog/confirm-dialog';

@Component({
    selector: 'app-product-detail',
    imports: [
        CurrencyPipe,
        SkeletonLoader,
        RouterLink,
        Breadcrumb,
        Header,
        Footer,
        NgOptimizedImage,
        Newsletter,
        ProductCard, ReactiveFormsModule
    ],
    templateUrl: './product-detail.html',
    styleUrl: './product-detail.css',
    animations: [staggerProducts],
})
export class ProductDetail implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly productService = inject(Products);
    private readonly vendorStoreService = inject(VendorStore);
    private readonly toastService = inject(ToastService);
    private readonly reviewService = inject(Reviews);
    private readonly loginService = inject(LoginService)
    private readonly seoService = inject(Seo);
    public readonly cartState = inject(CartState);
    public selectedImage: string | null = null;
    public readonly starIndices = [0, 1, 2, 3, 4];
    public readonly starGradientUid = Math.random().toString(36).slice(2, 9);
    public selectedImageIndex = 0;
    public wishlistedIds = new Set<string>();
    public product: ProductDetails | null = null;
    public vendorProductsDetails: ProductCardInterface[] = [];
    public vendorId = '';
    public vendorDetailedInfo: VendorDetailedInfoResponse | null = null;
    public isLoading = signal(true);
    public vendorDetailedInfoLoading = signal(false)
    public isVendorProductsLoading = signal(false);
    public isReviewsLoading = signal(false);
    public isTryingAgain = signal(false)
    public isLoadingMoreReviews = signal(false)
    public totalPagesArray: number[] = [];
    public activeButton = 'vendor-info';
    public buttons = buttons;
    public errorMessage = ''
    public showButton = true
    public quantity = 1;
    private readonly fb = inject(FormBuilder);
    public reviews = signal<Review[]>([]);
    public reviewsPagination = signal<ReviewsPagination | null>(null);
    public currentReviewsPage = signal(1);
    public isSubmittingReview = signal(false);
    public showReviewForm = signal(false);
    public hoveredStar = signal(0);
    public eligibleOrderId = signal<string | null>(null);
    public readonly starOptions = [1, 2, 3, 4, 5];
    public userVotes = signal<Map<string, VoteType>>(new Map());
    public pendingVotes = signal<Set<string>>(new Set());
    public editingReviewId = signal<string | null>(null);
    public deletingReviewId = signal<string | null>(null);
    public reviewForm: FormGroup = this.fb.group({
        rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
        title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
        comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    });
    private confirmDialog = inject(ConfirmDialogService);

    ngOnInit(): void {
        this.fetchProductDetails()
    }

    private setDefaultSelectedImage(): void {
        if (!this.product?.images?.length) {
            this.selectedImage = null;
            this.selectedImageIndex = 0;
            return;
        }
        const mainIndex = this.product.images.findIndex((img) => img.isMain);
        this.selectedImageIndex = mainIndex !== -1 ? mainIndex : 0;
        this.selectedImage = this.product.images[this.selectedImageIndex].url;
    }

    public selectImage(index: number): void {
        if (!this.product) return;
        this.selectedImageIndex = index;
        this.selectedImage = this.product.images[index].url;
    }

    public showPrevImage(): void {
        if (!this.product?.images?.length) return;
        const newIndex = (this.selectedImageIndex - 1 + this.product.images.length) % this.product.images.length;
        this.selectImage(newIndex);
    }

    public showNextImage(): void {
        if (!this.product?.images?.length) return;
        const newIndex = (this.selectedImageIndex + 1) % this.product.images.length;
        this.selectImage(newIndex);
    }

    public starFillPercent(index: number, rating: number): number {
        const diff = rating - index;
        return Math.round(Math.min(Math.max(diff, 0), 1) * 100);
    }

    public decrementQuantity(): void {
        if (this.quantity > 1) {
            this.quantity--;
        }
    }

    public incrementQuantity(): void {
        const maxStock = this.product?.stockQuantity ?? 0;
        if (this.quantity < maxStock) {
            this.quantity++;
        }
    }

    public addToCart(product: ProductDetails): void {
        if (product.stockQuantity <= 0) {
            this.toastService.error('This product is out of stock');
            return;
        }

        const safeQuantity = Math.min(this.quantity, product.stockQuantity);
        if (safeQuantity !== this.quantity) {
            this.quantity = safeQuantity;
        }

        const priceSnapshot: PriceSnapshot = {
            productName: product.name,
            effectivePrice: product.effectivePrice,
            price: product.price,
            salePrice: product.salePrice
        };

        const displayInfo: GuestCartDisplayInfo = {
            productImage: product.images?.[0]?.url ?? '',
            vendorId: product.vendor._id,
            businessName: product.vendor.businessName,
        };

        this.cartState.addToCart(product._id, safeQuantity, priceSnapshot, displayInfo);
    }

    public isAddingToCart(): boolean {
        return this.product ? this.cartState.isAdding(this.product._id) : false;
    }

    private buildOgImageUrl(product: ProductDetails): string {
        const image = product.images?.[0];
        if (!image) {
            return 'https://trademall-frontend.vercel.app/assets/images/og-default.jpeg';
        }

        const hasSale = !!product.salePrice && product.salePrice < product.price;

        const params = new URLSearchParams({
            image: image.url,
            salePrice: String(hasSale ? product.salePrice : product.price),
            rating: (product.rating ?? 0).toFixed(1),
            reviewCount: String(product.reviewCount ?? 0),
        });

        if (hasSale) params.set('originalPrice', String(product.price));
        if (product.discount) params.set('discount', String(product.discount));

        return `https://trademall-frontend.vercel.app/api/og?${params.toString()}`;
    }

    private updateSeo(): void {
        if (!this.product) return;

        const ogImage = this.buildOgImageUrl(this.product);

        const productName = this.product.name?.trim()
        const productDescription = this.product.description?.trim()

        this.seoService.updatePageSeo({
            title: this.product.metaTitle?.trim() || `${productName} | TradeMall`,
            description:
                this.product.metaDescription?.trim() ||
                `${productDescription}`,
            url: `https://trademall-frontend.vercel.app/products/${this.product.slug}`,
            image: ogImage
        });
    }

    public fetchProductDetails() {
        this.isTryingAgain.set(true)
        this.route.paramMap.subscribe((params) => {
            const slug = params.get('slug');

            this.product = null;
            this.vendorProductsDetails = [];
            this.isLoading.set(true);
            this.isVendorProductsLoading.set(true);

            if (slug) {
                this.productService.getProductBySlug(slug).subscribe({
                    next: (response) => {
                        this.product = response.data;
                        this.updateSeo();
                        this.fetchVendorDetailedInfo(response.data._id)
                        this.vendorId = response.data.vendor._id;
                        this.isLoading.set(false);
                        this.fetchVendorProducts();
                        this.isTryingAgain.set(false)
                        this.setDefaultSelectedImage()
                        this.fetchReviews(response.data._id, 1, false)
                    },
                    error: (err) => {
                        if (err.error.message) {
                            this.errorMessage = err.error.message
                        }
                        if (err.status === 404) {
                            this.showButton = false
                        }
                        this.toastService.error(err.error.message ? err.error.message : 'An error occurred while fetching product details. Try again')
                        console.error('Failed to fetch product', err);
                        this.isLoading.set(false);
                        this.isTryingAgain.set(false)
                    },
                });
            }
        });
    }

    get specifications() {
        if (!this.product) return [];

        return Object.entries(this.product.attributes ?? {}).map(
            ([label, value]) => ({
                label,
                value,
            })
        );
    }

    public switchButtons(activeButton: string) {
        this.activeButton = activeButton;
    }

    private fetchVendorDetailedInfo(productId: string) {
        this.vendorDetailedInfoLoading.set(true)

        this.vendorStoreService.getDetailedVendorInfoForAProduct(productId).subscribe({
            next: (res) => {
                this.vendorDetailedInfo = res
                this.vendorDetailedInfoLoading.set(false)
            },
            error: (err) => {
                this.toastService.error(err.error.message)
                console.error('Failed to fetch vendor info', err);
                this.vendorDetailedInfoLoading.set(false)
            }
        })
    }

    public averageRating(): number {
        const list = this.reviews();
        if (!list.length) return 0;
        return list.reduce((sum, r) => sum + r.rating, 0) / list.length;
    }

    public ratingBreakdown(): { star: number; count: number; percent: number }[] {
        const list = this.reviews();
        const total = list.length || 1;
        return [5, 4, 3, 2, 1].map((star) => {
            const count = list.filter((r) => r.rating === star).length;
            return { star, count, percent: Math.round((count / total) * 100) };
        });
    }

    public setRating(value: number): void {
        this.reviewForm.get('rating')?.setValue(value);
    }

    public toggleReviewForm(): void {
        this.showReviewForm.update((v) => !v);
    }

    public startEditReview(review: Review): void {
        this.editingReviewId.set(review._id);
        this.reviewForm.setValue({
            rating: review.rating,
            title: review.title,
            comment: review.comment,
        });
        this.showReviewForm.set(true);
    }

    public cancelReviewForm(): void {
        this.editingReviewId.set(null);
        this.reviewForm.reset({ rating: 0, title: '', comment: '' });
        this.showReviewForm.set(false);
    }

    public async deleteReview(reviewId: string): Promise<void> {
        const confirmed = await this.confirmDialog.confirm({
            title: 'Delete review?',
            message: 'This will permanently remove your review. This can’t be undone.',
            confirmLabel: 'Delete',
            variant: 'danger'
        });

        if (!confirmed) return;

        this.deletingReviewId.set(reviewId);
        this.reviewService.deleteReview(reviewId).subscribe({
            next: () => {
                this.reviews.update((list) => list.filter((r) => r._id !== reviewId));
                this.reviewsPagination.update((p) => (p ? { ...p, total: Math.max(0, p.total - 1) } : p));
                this.deletingReviewId.set(null);
                this.toastService.success('Review deleted');
            },
            error: (err) => {
                this.deletingReviewId.set(null);
                this.toastService.error(err.error?.message ?? 'Failed to delete review');
            },
        });
    }

    public submitReview(productId: string): void {
        const editingId = this.editingReviewId();

        if (editingId) {
            this.isSubmittingReview.set(true);
            this.reviewService.updateReview(editingId, this.reviewForm.value).subscribe({
                next: (res) => {
                    const updated = res.data.review;
                    this.reviews.update((list) =>
                        list.map((r) =>
                            r._id === editingId
                                ? { ...r, rating: updated.rating, title: updated.title, comment: updated.comment }
                                : r
                        )
                    );
                    this.cancelReviewForm();
                    this.isSubmittingReview.set(false);
                    this.toastService.success(res.message ?? 'Review updated');
                },
                error: (err) => {
                    this.toastService.error(err.error?.message ?? 'Failed to update review');
                    this.isSubmittingReview.set(false);
                },
            });
            return;
        }

        const orderId = this.eligibleOrderId();
        if (!orderId) {
            this.toastService.error('You can only review products you have purchased');
            return;
        }

        this.isSubmittingReview.set(true);
        const payload: ReviewFormData = { orderId, productId, ...this.reviewForm.value };

        this.reviewService.createReview(payload).subscribe({
            next: (res) => {
                this.reviews.update((list) => [res.data, ...list]);
                this.reviewsPagination.update((p) => (p ? { ...p, total: p.total + 1 } : p));
                this.reviewForm.reset({ rating: 0, title: '', comment: '' });
                this.showReviewForm.set(false);
                this.isSubmittingReview.set(false);
                this.toastService.success('Review submitted — thanks for the feedback!');
            },
            error: (err) => {
                this.toastService.error(err.error?.message ?? 'Failed to submit review');
                this.isSubmittingReview.set(false);
            },
        });
    }

    public displayErrorMessage(name: string): string {
        const control = this.reviewForm.get(name);

        if (control?.invalid && (control.dirty || control.touched)) {
            if (control.errors?.['required']) {
                return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
            }

            if (control.errors?.['minlength']) {
                return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
            }

            if (control.errors?.['maxlength']) {
                return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at most ${control.errors['maxlength'].requiredLength} characters`;
            }
        }

        return '';
    }

    public isVotePending(reviewId: string): boolean {
        return this.pendingVotes().has(reviewId);
    }

    public currentVote(reviewId: string): VoteType | undefined {
        return this.userVotes().get(reviewId);
    }

    public markHelpful(reviewId: string, uiType: 'helpful' | 'notHelpful'): void {
        const voteType: VoteType = uiType === 'helpful' ? 'helpful' : 'not_helpful';
        const previousVote = this.userVotes().get(reviewId);

        if (previousVote === voteType) return;
        if (this.isVotePending(reviewId)) return;

        const snapshot = this.reviews().find((r) => r._id === reviewId);
        if (!snapshot) return;
        const previousCounts = { helpful: snapshot.helpful, notHelpful: snapshot.notHelpful };

        this.pendingVotes.update((set) => new Set(set).add(reviewId));

        this.reviews.update((list) =>
            list.map((r) => {
                if (r._id !== reviewId) return r;
                const next = { ...r };
                if (previousVote) {
                    const previousField = previousVote === 'helpful' ? 'helpful' : 'notHelpful';
                    next[previousField] = Math.max(0, next[previousField] - 1);
                }
                const nextField = uiType === 'helpful' ? 'helpful' : 'notHelpful';
                next[nextField] = next[nextField] + 1;
                return next;
            })
        );
        this.userVotes.update((map) => new Map(map).set(reviewId, voteType));

        this.reviewService.voteOnReview(reviewId, voteType).subscribe({
            next: (res) => {
                this.reviews.update((list) =>
                    list.map((r) =>
                        r._id === reviewId
                            ? { ...r, helpful: res.data.helpful, notHelpful: res.data.notHelpful }
                            : r
                    )
                );
                this.pendingVotes.update((set) => {
                    const next = new Set(set);
                    next.delete(reviewId);
                    return next;
                });
                this.toastService.success(res.message ?? 'Vote recorded successfully');
            },
            error: (err) => {
                this.reviews.update((list) =>
                    list.map((r) => (r._id === reviewId ? { ...r, ...previousCounts } : r))
                );
                this.userVotes.update((map) => {
                    const next = new Map(map);
                    if (previousVote) {
                        next.set(reviewId, previousVote);
                    } else {
                        next.delete(reviewId);
                    }
                    return next;
                });
                this.pendingVotes.update((set) => {
                    const next = new Set(set);
                    next.delete(reviewId);
                    return next;
                });
                this.toastService.error(err.error?.message ?? 'Failed to register your vote');
            },
        });
    }

    public loadMoreReviews(productId: string): void {
        if (this.isLoadingMoreReviews()) {
            return;
        }

        const next = this.currentReviewsPage() + 1;

        this.fetchReviews(productId, next, true);
    }

    public initials(user: { firstName: string; lastName: string }): string {
        return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
    }

    public timeAgo(dateStr: string): string {
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diffMs / 86400000);
        if (days < 1) return 'Today';
        if (days === 1) return '1 day ago';
        if (days < 30) return `${days} days ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
        const years = Math.floor(months / 12);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }

    private fetchReviews(productId: string, page = 1, append = false): void {
        if (append) {
            this.isLoadingMoreReviews.set(true);
        } else {
            this.isReviewsLoading.set(true);
        }

        this.reviewService
            .getReviewsForAProduct(productId, page)
            .pipe(
                finalize(() => {
                    if (append) {
                        this.isLoadingMoreReviews.set(false);
                    } else {
                        this.isReviewsLoading.set(false);
                    }
                })
            )
            .subscribe({
                next: (response) => {
                    this.reviews.update((list) =>
                        append
                            ? [...list, ...response.data.reviews]
                            : response.data.reviews
                    );

                    this.reviewsPagination.set(response.data.pagination);
                    this.currentReviewsPage.set(page);
                },

                error: (err) => {
                    this.toastService.error(
                        err.error?.message ?? 'Failed to load reviews'
                    );
                },
            });
    }

    get currentUser() {
        return this.loginService.getCurrentUser();
    }

    public toggleWishlist(productId: string, productName: string = ''): void {
        if (this.wishlistedIds.has(productId)) {
            this.wishlistedIds.delete(productId);
            this.toastService.success(`${productName} removed from wishlist`);
        } else {
            this.wishlistedIds.add(productId);
            this.toastService.success(`${productName} added to wishlist`);
        }
    }

    private fetchVendorProducts(currentPage = 1) {
        this.isVendorProductsLoading.set(true);
        this.vendorStoreService.getVendorProductsById(this.vendorId, currentPage).subscribe({
            next: (response) => {
                this.vendorProductsDetails = response.data;
                this.isVendorProductsLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to fetch vendor products', err);
                this.isVendorProductsLoading.set(false);
            },
        });
    }
}
