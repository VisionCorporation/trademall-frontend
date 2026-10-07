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
  digitalAddress?: string;
  physicalAddress?: string;
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

export interface VendorDetailedInfoResponse {
  success: boolean;
  vendor: VendorDetailedInfo;
}

export interface VendorDetailedInfo {
  _id: string;
  rating: number;
  reviewCount: number;
  businessName: string;
  subdomain: string;
  location: VendorLocation;
}

export interface VendorLocation {
  city: string;
  digitalAddress: string;
  physicalAddress: string;
  region: string;
}


export interface CreatedStoreLocation {
  city: string;
  digitalAddress: string;
  physicalAddress: string;
  region: string;
}

export interface CreatedStore {
  _id: string;
  vendor: string;
  name: string;
  subdomain: string;
  description: string;
  shippingPolicy: string;
  returnPolicy: string;
  termsAndConditions: string;
  location: CreatedStoreLocation;
  isActive: boolean;
  isPaused: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateOrUpdateStoreDetailsResponse {
  success: boolean;
  message: string;
  store: CreatedStore;
}

export interface createOrUpdateStoreLocationResponse {
  success: boolean;
  message: string;
}

export interface createOrUpdateStoreDetailsPayload {
  name: string;
  subdomain: string;
  description: string;
  shippingPolicy: string;
  returnPolicy: string;
  termsAndConditions: string;
}

export interface createOrUpdateStoreLocationPayload {
  region: string;
  city: string;
  digitalAddress: string;
  physicalAddress: string;
}