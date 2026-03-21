export interface VendorProduct {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  vendor: string;
  description: string;
  attributes: { [key: string]: string };
  price: number;
  salePrice: number | null;
  images: {
    url: string;
    isMain: boolean;
    _id: string;
  }[];
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
}

export interface VendorInfo {
  _id: string;
  name: string;
  businessName: string;
  vendorStatus: string;
  isVerified: boolean;
  dateOfJoining: string;
}

export interface VendorPagination {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface VendorProductsResponse {
  success: boolean;
  vendor: VendorInfo;
  pagination: VendorPagination;
  data: VendorProduct[];
}
