import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { CategoriesResponse, Category } from '../../interfaces/categories.interface';

@Injectable({
  providedIn: 'root',
})
export class Products {
  private http = inject(HttpClient);
  private readonly CATEGORIES_KEY = 'categories';
  private readonly CHILDREN_KEY = 'childrenMap';
  private childrenMap: Map<string, Category[]> = new Map();
  private cachedCategories: Category[] = [];

  public getAllCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(
      `${environment.apiBaseUrl}/products/categories/hierarchy/tree`,
    );
  }

  public getCategoryWithDirectChildren(categorySlug: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiBaseUrl}/products/categories/${categorySlug}/with-children`,
    );
  }

  public getProductsByCategory(categorySlug: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/products/category/${categorySlug}/`);
  }

  public getAllCategoriesWithChildren(): Observable<Category[]> {
    if (this.cachedCategories.length > 0) {
      return of(this.cachedCategories);
    }

    const storedCategories = sessionStorage.getItem(this.CATEGORIES_KEY);
    const storedChildren = sessionStorage.getItem(this.CHILDREN_KEY);

    if (storedCategories && storedChildren) {
      this.cachedCategories = JSON.parse(storedCategories);
      const childrenObj = JSON.parse(storedChildren);
      Object.entries(childrenObj).forEach(([slug, children]) => {
        this.childrenMap.set(slug, children as Category[]);
      });
      return of(this.cachedCategories);
    }

    return this.getAllCategories().pipe(
      switchMap((response) => {
        const categories = response.data;

        const childrenRequests = categories.map((category) =>
          this.getCategoryWithDirectChildren(category.slug),
        );

        return forkJoin(childrenRequests).pipe(
          map((childrenResponses) => {
            const childrenObj: Record<string, Category[]> = {};

            childrenResponses.forEach((res, index) => {
              const slug = categories[index].slug;
              this.childrenMap.set(slug, res.data.children);
              childrenObj[slug] = res.data.children;
            });

            this.cachedCategories = categories;

            sessionStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
            sessionStorage.setItem(this.CHILDREN_KEY, JSON.stringify(childrenObj));

            return categories;
          }),
        );
      }),
    );
  }

  getChildrenFromCache(slug: string): Category[] {
    return this.childrenMap.get(slug) ?? [];
  }

  public getProductBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/products/${slug}/`);
  }
}
