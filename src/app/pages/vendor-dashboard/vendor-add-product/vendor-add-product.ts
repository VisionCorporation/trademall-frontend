import { Component, inject, OnInit, signal } from '@angular/core';
import { fadeInOutAnimation } from '../../../animations/toast.animations';
import { ClickOutside } from '../../../directives/click-outside/click-outside';
import { Products } from '../../../services/products/products';
import { Category, RootCategory } from '../../../interfaces/categories.interface';

@Component({
  selector: 'app-vendor-add-product',
  imports: [ClickOutside],
  templateUrl: './vendor-add-product.html',
  styleUrl: './vendor-add-product.css',
  animations: [fadeInOutAnimation]
})
export class VendorAddProduct implements OnInit {
  public categories: RootCategory[] = []
  public subCategories: Category[] = []
  public isCategoryOpen = false
  public isSubCategoryOpen = false
  public selectedCategory: RootCategory | null = null
  public selectedSubCategory: Category | null = null
  private readonly categoryService = inject(Products)
  public isCategoryLoading = signal(false)
  public isSubCategoryLoading = signal(false)
  public hasCategoryFailed = signal(false);
  public hasSubCategoryFailed = signal(false);

  ngOnInit() {
    this.fetchCategories()
  }

  public fetchCategories() {
    this.isCategoryLoading.set(true)
    this.hasCategoryFailed.set(false);
    this.categoryService.getRootCategories(1).subscribe({
      next: (response) => {
        this.categories = response.data;
        this.isCategoryLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch categories', err);
        this.isCategoryLoading.set(false);
        this.hasCategoryFailed.set(true);
      },
    });
  }

  public fetchSubCategories() {
    if (this.selectedCategory) {
      this.isSubCategoryLoading.set(true)
      this.hasSubCategoryFailed.set(false);
      this.categoryService.getSubCategories(this.selectedCategory.slug).subscribe({
        next: (response) => {
          this.subCategories = response.data;
          this.isSubCategoryLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to fetch subcategories', err);
          this.isSubCategoryLoading.set(false);
          this.hasSubCategoryFailed.set(true);
        },
      });
    }
  }

  public selectCategory(category: RootCategory) {
    this.selectedCategory = category;
    this.selectedSubCategory = null;
    this.fetchSubCategories();
    this.isCategoryOpen = false;
  }

  public selectSubCategory(subCategory: Category) {
    this.selectedSubCategory = subCategory;
    this.isSubCategoryOpen = false;
  }
}
