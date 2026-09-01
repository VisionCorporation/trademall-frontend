export interface CartProductId {
  _id: string;
  name: string;
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

export interface PriceSnapshot {
  productName: string;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
}

export interface GuestCartDisplayInfo {
  productImage: string;
  vendorId: string;
  businessName: string;
}

export interface GuestCartItem {
  productId: string;
  quantity: number;
  priceSnapshot: PriceSnapshot;
  displayInfo: GuestCartDisplayInfo;
}

export interface GuestCartStorage {
  guestCartItems: GuestCartItem[];
}