export interface RootCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  metaTitle: string;
  displayOrder: number;
  isFeatured: boolean;
}

export interface RootCategoryResponse {
  success: boolean;
  totalResults: number;
  data: RootCategory[];
}


export interface SelectedCategoryDetail {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  directProductCount: number;
  totalProductCount: number;
  hasChildren: boolean;
}

export interface SelectedCategoryChild {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  isActive: boolean;
  parent: string;
  displayOrder: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SelectedCategoryDetailData {
  category: SelectedCategoryDetail;
  totalProductsInTree: number;
  children: SelectedCategoryChild[];
}

export interface SelectedCategoryDetailResponse {
  success: boolean;
  data: SelectedCategoryDetailData;
}