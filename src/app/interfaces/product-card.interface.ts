interface Vendor {
    _id: string;
}

interface Store {
    _id: string;
    name: string;
    subdomain: string;
}

interface Category {
    _id: string;
    name: string;
    slug: string;
}

interface Image {
    _id: string;
    url: string;
    isMain: boolean;
}

interface Pagination {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}

export interface ProductCardInterface {
    id: string;
    name: string;
    description: string;
    slug: string;
    brand: string;
    price: number;
    salePrice: number;
    effectivePrice: number;
    discount: number;
    images: Image[];
    category: Category;
    store: Store;
    vendor: Vendor;
    stockQuantity: number;
    availability: 'in_stock' | 'out_of_stock' | 'pre_order';
    reviewCount: number;
    rating: number;
}

export interface FeaturedProductsResponse {
    success: boolean;
    data: ProductCardInterface[];
}

export interface AllProductsResponse {
    success: boolean;
    pagination: Pagination;
    data: ProductCardInterface[];
}

export interface CategoryInfo {
    name: string;
    slug: string;
    description: string;
    includeSubcategories: boolean;
    selectedSubcategories: string[];
}

export interface CategoryProductsResponse {
    success: boolean;
    category: CategoryInfo;
    pagination: Pagination;
    products: ProductCardInterface[];
}

export interface VendorProductsResponse {
    success: boolean;
    pagination: Pagination;
    data: ProductCardInterface[];
}