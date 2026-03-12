export interface ProductImage {
  url: string;
  isMain: boolean;
  _id: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface ProductVendor {
  _id: string;
  businessName: string;
  kycVerified: boolean;
  vendorStatus: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand?: string;
  price: number;
  salePrice: number | null;
  images: ProductImage[];
  category: ProductCategory;
  vendor: ProductVendor | string; 
  attributes: Record<string, string>;
  status: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isPreOrder: boolean;
  preOrderDays: number;
  minPreOrderQuantity: number;
  rating: number;
  reviewCount: number;
  isSearchable: boolean;
  isVisible: boolean;
  viewCount: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  approvedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductVendorInfo {
  _id: string;
  name: string;
  businessName: string;
  vendorStatus: string;
  isVerified: boolean;
  dateOfJoining: string;
}

export interface ProductPagination {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface ProductsResponse {
  success: boolean;
  vendor: ProductVendorInfo;
  pagination: ProductPagination;
  data: Product[];
}