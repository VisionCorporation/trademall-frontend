export interface Category {
  _id: string;
  name: string;
  description: string;
  displayOrder: number;
  image: string | null;
  isFeatured: boolean;
  parent: string;
  slug: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}
