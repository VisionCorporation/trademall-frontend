export interface Product {
  _id: string;
  name: string;
  description: string;
  metaDescription: string;
  metaTitle: string;
  metaKeywords: string[];
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  rating: number;
  reviewCount: number;
  viewCount: number;
  isPreOrder: boolean;
  isSearchable: boolean;
  isVisible: boolean;
  minPreOrderQuantity: number;
  preOrderDays: number;
  status: string;
  slug: string;
  brand: string;
  images: ProductImage[];
  attributes: Record<string, string>;
  approvedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  category: {
    _id: string;
    name: string;
    slug: string;
    parent: string;
  };
  vendor: {
    _id: string;
    businessName: string;
    kycVerified: boolean;
    vendorStatus: string;
  };
}

interface ProductImage {
  isMain: boolean;
  url: string;
  _id: string;
}
