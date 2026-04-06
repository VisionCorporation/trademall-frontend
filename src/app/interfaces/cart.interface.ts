export interface CartProductImage {
  url: string;
  isMain: boolean;
  _id: string;
  uploadedAt: string;
}

export interface CartProductId {
  _id: string;
  name: string;
  images: CartProductImage[];
  isVisible: boolean;
  status: string;
  stockQuantity: number;
  vendor: string;
}

export interface CartItem {
  _id: string;
  productId: CartProductId;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  lineTotal: number;
  isAvailable: boolean;
  isPreOrder: boolean;
  priceChanged: boolean;
  unavailabilityReason: string | null;
}

export interface VendorGroup {
  vendorId: string;
  vendorName: string;
  businessName: string;
  subtotal: number;
  items: CartItem[];
}

export interface Cart {
  isEmpty: boolean;
  itemCount: number;
  unavailableItemCount: number;
  hasPriceChanges: boolean;
  items: number;
  vendorGroups: VendorGroup[];
}

export interface CartData {
  cart: Cart;
}

export interface CartResponse {
  status: string;
  data: CartData;
}
