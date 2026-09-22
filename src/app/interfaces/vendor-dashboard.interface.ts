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
  status: 'approved' | 'pending' | 'rejected' | 'inactive';
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
  currentPage: number
  limit: number
  totalPages: number
  totalResults: number;
}

export interface ProductsResponse {
  success: boolean;
  summary: ProductSummary;
  pagination: ProductPagination;
  data: Product[];
}

export interface VariationPayload {
  name: string;
  type: 'select';
  options: string[];
  required: boolean;
  displayOrder: number;
}

export interface VariantPayload {
  variationValues: Record<string, string>;
  sku: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  weight: number;
  image?: { url: string; publicId: string };
}

export interface ProductVariation {
  name: string;
  type: 'select';
  options: string[];
  required: boolean;
  displayOrder: number;
}

export interface ProductVariant {
  variationValues: Record<string, string>;
  sku: string;
  price: number | null;
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  isActive: boolean;
  weight: number | null;
  image?: { url: string; publicId: string } | null;
}

export interface AttributeRow {
  key: string;
  value: string;
}

export interface DeleteProductResponse {
  success: boolean
  message: string
}