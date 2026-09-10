import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { fadeInOutAnimation } from '../../../animations/toast.animations';
import { ClickOutside } from '../../../directives/click-outside/click-outside';
import { Products } from '../../../services/products/products';
import { Category, RootCategory } from '../../../interfaces/categories.interface';
import { FormsModule } from '@angular/forms';
import { Attribute, ProductGeneralDetailsPayload } from '../../../interfaces/products.interface';
import { FormStep } from '../../../types/add-product.type';
import { ToastService } from '../../../services/toast/toast.service';
import { Router } from '@angular/router';
import { ADD_PRODUCT_STEPS } from '../../../data/constants/vendor-dashbaord.constant';
import { VendorDashboard } from '../../../services/vendor-dashboard/vendor-dashboard';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-vendor-add-product',
  imports: [ClickOutside, FormsModule,],
  templateUrl: './vendor-add-product.html',
  styleUrl: './vendor-add-product.css',
  animations: [fadeInOutAnimation]
})
export class VendorAddProduct implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  attributes: Attribute[] = [{ name: '', value: '' }];
  public categories = signal<RootCategory[]>([]);
  public subCategories = signal<Category[]>([]);
  public isCategoryOpen = false
  public isSubCategoryOpen = false
  public selectedCategory: RootCategory | null = null
  public selectedSubCategory: Category | null = null
  private readonly categoryService = inject(Products)
  public isCategoryLoading = signal(false)
  public isSubCategoryLoading = signal(false)
  public hasCategoryFailed = signal(false);
  public hasSubCategoryFailed = signal(false);
  public step = signal<FormStep>('general');
  public addProductSteps = ADD_PRODUCT_STEPS
  public createdProductId = signal<string | null>(null);
  public isSubmittingDetails = signal(false);
  public isUploadingImages = signal(false);
  public previewUrls: (string | null)[] = [];
  public selectedFiles: File[] = [];
  private taostService = inject(ToastService)
  private readonly vendorDashbaordService = inject(VendorDashboard)
  private cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router)

  public productGeneralDetailsForm = {
    name: '',
    description: '',
    price: 0,
    category: '',
    subcategory: ''
  };

  ngOnInit() {
    this.fetchCategories()
  }

  public fetchCategories() {
    this.isCategoryLoading.set(true)
    this.hasCategoryFailed.set(false);

    this.categoryService.getRootCategories(1).subscribe({
      next: (firstPage) => {
        const { totalPages } = firstPage.pagination;

        if (totalPages <= 1) {
          this.categories.set(this.sortCategories(firstPage.data));
          this.isCategoryLoading.set(false);
          return;
        }

        const remainingPages$ = Array.from({ length: totalPages - 1 }, (_, i) =>
          this.categoryService.getRootCategories(i + 2)
        );

        forkJoin(remainingPages$).subscribe({
          next: (restPages) => {
            const allCategories = [
              ...firstPage.data,
              ...restPages.flatMap((res) => res.data),
            ];
            this.categories.set(this.sortCategories(allCategories));
            this.isCategoryLoading.set(false);
          },
          error: (err) => {
            console.error('Failed to load remaining categories', err);
            this.categories.set(this.sortCategories(firstPage.data));
            this.isCategoryLoading.set(false);
          },
        });
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.hasCategoryFailed.set(true);
        this.isCategoryLoading.set(false);
      },
    });
  }

  public fetchSubCategories() {
    if (this.selectedCategory) {
      this.isSubCategoryLoading.set(true)
      this.hasSubCategoryFailed.set(false);
      this.categoryService.getSubCategories(this.selectedCategory.slug).subscribe({
        next: (response) => {
          this.subCategories.set(response.data)
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
    this.productGeneralDetailsForm.category = category._id;
    this.fetchSubCategories();
    this.isCategoryOpen = false;
  }

  public selectSubCategory(subCategory: Category) {
    this.selectedSubCategory = subCategory;
    this.productGeneralDetailsForm.subcategory = subCategory._id;
    this.isSubCategoryOpen = false;
  }

  private sortCategories(list: RootCategory[]): RootCategory[] {
    return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public buildPayload() {
    const payload = {
      name: this.productGeneralDetailsForm.name,
      description: this.productGeneralDetailsForm.description,
      price: this.productGeneralDetailsForm.price,
      category: this.productGeneralDetailsForm.category,
      subcategory: this.productGeneralDetailsForm.subcategory
    };

    return payload;
  }

  public get isFormValid(): boolean {
    return (
      this.productGeneralDetailsForm.name.trim() !== '' &&
      this.productGeneralDetailsForm.description.trim() !== '' &&
      this.productGeneralDetailsForm.price > 0 &&
      this.productGeneralDetailsForm.category !== '' &&
      this.productGeneralDetailsForm.subcategory !== ''
    );
  }

  private resetGeneralDetailsForm(): void {
    this.productGeneralDetailsForm = {
      name: '',
      description: '',
      price: 0,
      category: '',
      subcategory: ''
    };
    this.selectedCategory = null;
    this.selectedSubCategory = null;
  }

  private resetImageUploadForm() {
    this.selectedFiles = [];
    this.previewUrls = [];
  }

  public submitDetails(payload: ProductGeneralDetailsPayload) {
    this.isSubmittingDetails.set(true);

    this.vendorDashbaordService.submitProductGeneralDetails(payload).subscribe({
      next: (res) => {
        this.createdProductId.set(res.data._id);
        this.step.set('images');
        this.taostService.success(res.message);
        this.isSubmittingDetails.set(false);
        this.resetGeneralDetailsForm()
      },
      error: (err) => {
        this.taostService.error('Failed to save details. Please try again.');
        this.isSubmittingDetails.set(false);
      }
    });
  }


  public onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const incoming = Array.from(input.files);
    const remaining = 4 - this.selectedFiles.length;
    const toAdd = incoming.slice(0, remaining);

    toAdd.forEach(file => {
      const index = this.selectedFiles.length;

      this.selectedFiles = [...this.selectedFiles, file];
      this.previewUrls = [...this.previewUrls, null];

      const reader = new FileReader();
      reader.onload = (e) => {
        const updated = [...this.previewUrls];
        updated[index] = e.target?.result as string;
        this.previewUrls = updated;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  public removeImage(index: number) {
    this.previewUrls = this.previewUrls.filter((_, i) => i !== index);
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  public uploadImages() {
    const productId = this.createdProductId();
    if (!productId || this.selectedFiles.length === 0) return;

    this.isUploadingImages.set(true);

    const formData = new FormData();
    this.selectedFiles.forEach(file => formData.append('images', file));

    this.vendorDashbaordService.submitProductImages(productId, formData).subscribe({
      next: (res) => {
        this.isUploadingImages.set(false);
        this.step.set('advanced');
        this.taostService.success(res.message);
        this.resetImageUploadForm()
        this.router.navigate(['/vendor/products']);
      },
      error: (err) => {
        this.taostService.error(err?.error?.message ?? 'Image upload failed. Please try again.');
        this.isUploadingImages.set(false);
      }
    });
  }
}
