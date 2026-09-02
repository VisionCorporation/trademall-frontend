import { VendorStatus, VendorType } from "../types/vendor.type";

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