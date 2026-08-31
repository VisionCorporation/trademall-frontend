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
import { VendorProduct } from '../../interfaces/vendor.interface';
import { staggerProducts } from '../../animations/smooth-collapse.animations';
import { buttons } from '../../data/constants/product-details.constant';
import { Reviews } from '../../services/reviews/reviews';
import { VendorStore } from '../../services/vendor-store/vendor-store';
import { Seo } from '../../services/seo/seo';

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
    private readonly seoService = inject(Seo);
    public selectedImage: string | null = null;
    public readonly starIndices = [0, 1, 2, 3, 4];
    public readonly starGradientUid = Math.random().toString(36).slice(2, 9);
    public selectedImageIndex = 0;
    public wishlistedIds = new Set<string>();
    public product: ProductDetails | null = null;
    public vendorProductsDetails: VendorProduct[] = [];
    public vendorId = '';
    public isLoading = signal(true);
    public isVendorProductsLoading = signal(false);
    public isReviewsLoading = signal(false);
    public isTryingAgain = signal(false)
    public totalPagesArray: number[] = [];
    public activeButton = 'description';
    public buttons = buttons;
    public reviews: any;
    public errorMessage = ''
    public showButton = true
    public quantity = 1;

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
        const maxStock = this.product?.stockQuantity ?? Infinity;
        if (this.quantity < maxStock) {
            this.quantity++;
        }
    }

    private updateSeo(): void {
        if (!this.product) return;

        this.seoService.updatePageSeo({
            title: this.product.metaTitle,
            description: this.product.metaDescription,
            url: `https://trademall-frontend.vercel.app/products/${this.product.slug}`,
            image: this.product.images?.[0]?.url ?? ''
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
                        this.vendorId = response.data.vendor._id;
                        this.isLoading.set(false);
                        this.fetchVendorProducts();
                        this.isTryingAgain.set(false)
                        this.setDefaultSelectedImage()
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
        return Object.entries(this.product.attributes).map(([label, value]) => ({ label, value }));
    }

    public switchButtons(activeButton: string, productId: string) {
        this.activeButton = activeButton;

        if (activeButton === 'reviews') {
            this.fetchReviews(productId);
        }
    }

    private fetchReviews(productId: string) {
        this.isReviewsLoading.set(true);
        this.reviewService.getReviewsForAProduct(productId).subscribe({
            next: (response) => {
                this.reviews = response.data;
                console.log(this.reviews);
                this.isReviewsLoading.set(false);
            },
            error: (err) => {
                this.toastService.error(err.error.message);
                console.error('Failed to fetch reviews', err);
                this.isReviewsLoading.set(false);
            },
        });
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
