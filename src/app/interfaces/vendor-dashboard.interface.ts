export interface ProductImage {
  url: string;
  publicId?: string;
  isMain: boolean;
  uploadedAt: string;
  _id: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  category: ProductCategory;
  vendor: string;
  description: string;
  attributes: Record<string, string>;
  price: number;
  salePrice?: number | null;
  images: ProductImage[];
  status: 'approved' | 'pending' | 'rejected';
  stockQuantity: number;
  lowStockThreshold: number;
  isPreOrder: boolean;
  preOrderDays: number;
  minPreOrderQuantity: number;
  preOrderShippingFee: number;
  rating: number;
  reviewCount: number;
  isSearchable: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  hasVariants: boolean;
  isVisible: boolean;
  viewCount: number;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductSummary {
  pending: number;
  approved: number;
}

export interface ProductPagination {
  currentPage: number | null;
  limit: number | null;
  totalPages: number | null;
  totalResults: number;
}

export interface ProductsResponse {
  success: boolean;
  summary: ProductSummary;
  pagination: ProductPagination;
  data: Product[];
}