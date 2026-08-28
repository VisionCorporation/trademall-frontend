export interface ProductsResponse {
    success: boolean;
    pagination: Pagination;
    data: Product[];
}

export interface Pagination {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}

export interface Product {
    _id: string;
    name: string;
    slug: string;
    brand: string;
    category: Category;
    vendor: Vendor;
    description: string;
    attributes: Record<string, string>;
    price: number;
    salePrice: number | null;
    images: ProductImage[];
    status: string;
    stockQuantity: number;
    lowStockThreshold: number;
    isPreOrder: boolean;
    preOrderDays: number;
    minPreOrderQuantity: number;
    rating: number;
    reviewCount: number;
    isSearchable: boolean;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
    approvedAt: string;
    isVisible: boolean;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
    hasVariants: boolean;
    preOrderShippingFee: number;
    store: StoreDetails
    weight: number;
}

export interface Category {
    _id: string;
    name: string;
    slug: string;
}

export interface Vendor {
    _id: string;
    businessName: string;
}

export interface ProductImage {
    _id: string;
    url: string;
    isMain: boolean;
    uploadedAt: string;
}