export interface ProductImage {
  url: string;
  isMain: boolean;
  _id: string;
}

export interface ProductAttributes {
  [key: string]: string;
}

export interface ProductBreadcrumb {
  _id: string;
  name: string;
  slug: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  parent: string;
}

export interface ProductVendor {
  _id: string;
  name: string;
  businessName: string;
  email: string;
  vendorStatus: string;
  isVerified: boolean;
}

export interface ProductDetails {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  salePrice: number;
  effectivePrice: number;
  discount: number;
  description: string;
  attributes: ProductAttributes;
  images: ProductImage[];
  stockQuantity: number;
  lowStockThreshold: number;
  rating: number;
  reviewCount: number;
  viewCount: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  category: ProductCategory;
  vendor: ProductVendor;
  availability: 'in_stock' | 'out_of_stock' | 'pre_order';
  isPreOrder: boolean;
  deliveryTimeline: string;
  preOrderDays: number | null;
  minPreOrderQuantity: number | null;
  createdAt: string;
  updatedAt: string;
  relatedProducts: ProductDetails[];
  breadcrumbs: ProductBreadcrumb[];
}

export interface ProductDetailsResponse {
  success: boolean;
  data: ProductDetails;
}
