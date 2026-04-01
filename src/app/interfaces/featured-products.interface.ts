interface ProductImage {
  url: string;
  isMain: boolean;
  _id: string;
  uploadedAt: string;
}

interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
}

interface ProductVendor {
  _id: string;
  kycVerified: boolean;
  businessName: string;
}

interface FeaturedProduct {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  category: ProductCategory;
  vendor: ProductVendor;
  attributes: Record<string, string>;
  price: number;
  salePrice: number | null;
  images: ProductImage[];
  status: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isPreOrder: boolean;
  preOrderDays: number;
  preOrderShippingFee: number;
  minPreOrderQuantity: number;
  rating: number;
  reviewCount: number;
  isSearchable: boolean;
  isVisible: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  viewCount: number;
  approvedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface FeaturedProductsResponse {
  success: boolean;
  data: FeaturedProduct[];
}
