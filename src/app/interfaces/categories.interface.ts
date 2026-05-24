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

interface Pagination {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface RootCategoryResponse {
  success: boolean;
  pagination: Pagination;
  data: RootCategory[];
}

export interface CategoryParent {
  _id: string;
  name: string;
  slug: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  displayOrder: number;
  isFeatured: boolean;
  hasChildren: boolean;
}

export interface CategoryListResponse {
  success: boolean;
  parent: CategoryParent;
  totalResults: number;
  data: Category[];
}