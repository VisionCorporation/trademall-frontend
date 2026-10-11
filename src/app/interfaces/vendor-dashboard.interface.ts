export interface ProductImage {
  _id: string;
  url: string;
  publicId?: string;
  isMain: boolean;
  uploadedAt?: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface ProductStore {
  _id: string;
  name: string;
  subdomain: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  category: ProductCategory;
  vendor: string;
  store: ProductStore;
  price: number;
  salePrice?: number | null;
  images: ProductImage[];
  status: 'approved' | 'pending' | 'rejected' | 'draft';
  stockQuantity: number;
  isPreOrder: boolean;
  rating: number;
  reviewCount: number;
  hasVariants: boolean;
  isVisible: boolean;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStatusSummary {
  total: number;
  visible: number;
  hidden: number;
}

export interface ProductSummary {
  total: number;
  byStatus: {
    draft: ProductStatusSummary;
    pending: ProductStatusSummary;
    approved: ProductStatusSummary;
    rejected: ProductStatusSummary;
  };
  visibility: {
    visible: number;
    hidden: number;
  };
}

export interface ProductPagination {
  currentPage: number;
  limit: number;
  totalPages: number;
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

export interface PrductToggleVisibilityResponse {
  success: boolean;
  message: string
  data: {
    _id: string
    isVisible: boolean
  }
}