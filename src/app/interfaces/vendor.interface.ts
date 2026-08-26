import { VendorStatus, VendorType } from "../types/vendor.type";

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

export interface VendorPagination {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface VendorProductsResponse {
  success: boolean;
  pagination: VendorPagination;
  data: VendorProduct[];
}

export interface StoreResponse {
  success: boolean;
  store: Store;
  vendor: Vendor;
}

export interface Store {
  name: string;
  subdomain: string;
  phoneNumber: string;
  region: string;
  city: string;
  description: string;
  shippingPolicy: string;
  returnPolicy: string;
  termsAndConditions: string;
  logo: string | null;
  banner: string | null;
  rating: number;
  reviewCount: number;
}

export interface Vendor {
  _id: string;
  vendorStatus: VendorStatus;
  vendorType: VendorType;
  isVerified: boolean;
  dateOfJoining: string;
}