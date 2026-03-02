export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export interface ProductsInterface {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  businessName: string;
  category: string;
}
