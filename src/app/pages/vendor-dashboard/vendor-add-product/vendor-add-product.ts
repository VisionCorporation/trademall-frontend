import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { fadeInOutAnimation } from '../../../animations/toast.animations';
import { Products } from '../../../services/products/products';
import { Category, RootCategory } from '../../../interfaces/categories.interface';
import { FormsModule } from '@angular/forms';
import { ProductGeneralDetailsPayload } from '../../../interfaces/products.interface';
import { FormStep } from '../../../types/add-product.type';
import { ToastService } from '../../../services/toast/toast.service';
import { Router } from '@angular/router';
import { ADD_PRODUCT_STEPS } from '../../../data/constants/vendor-dashbaord.constant';
import { VendorDashboard } from '../../../services/vendor-dashboard/vendor-dashboard';
import { forkJoin } from 'rxjs';
import { DropdownOverlay } from '../../../shared/directives/dropdown-overlay/dropdown-overlay';
import { AttributeRow, VariantRow } from '../../../interfaces/vendor-dashboard.interface';

@Component({
  selector: 'app-vendor-add-product',
  imports: [FormsModule, DropdownOverlay],
  templateUrl: './vendor-add-product.html',
  styleUrl: './vendor-add-product.css',
  animations: [fadeInOutAnimation]
})
export class VendorAddProduct implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  public variantRows: VariantRow[] = [{ name: '', value: '', priceAdjustment: null }];
  public attributeRows: AttributeRow[] = [{ key: '', value: '' }];
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
  public isFinishingSetup = signal(false);
  public previewUrls: (string | null)[] = [];
  public selectedFiles: File[] = [];
  private toastService = inject(ToastService)
  private readonly vendorDashbaordService = inject(VendorDashboard)
  private cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router)
  private readonly maxFileSize = 500 * 1024;
  private readonly maxImages = 4;

  public productGeneralDetailsForm = {
    name: '',
    description: '',
    price: null as number | null,
    category: '',
    subcategory: ''
  };

  public productAdvancedDetailsForm: ProductGeneralDetailsPayload = {
    name: '',
    description: '',
    price: null as number | null,
    category: '',
    subcategory: '',
    brand: '',
    isPreOrder: false,
    hasVariants: false,
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
      this.productGeneralDetailsForm.price !== null &&
      this.productGeneralDetailsForm.category !== '' &&
      this.productGeneralDetailsForm.subcategory !== ''
    );
  }

  public preventInvalidNumberInput(event: KeyboardEvent): void {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  public onPriceChange(value: number | string | null): void {
    if (value === null || value === '') {
      this.productGeneralDetailsForm.price = null;
      return;
    }
    this.productGeneralDetailsForm.price = Number(value);
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
        this.toastService.success(res.message ?? "Product details saved successfully");
        this.isSubmittingDetails.set(false);
        this.resetGeneralDetailsForm()
      },
      error: (err) => {
        this.toastService.error('Failed to save details. Please try again.');
        this.isSubmittingDetails.set(false);
      }
    });
  }


  public onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const validFiles = Array.from(input.files).filter(file => {
      if (file.size > this.maxFileSize) {
        this.toastService.error(
          `${file.name} is too large. Images must be 500 KB or less.`
        );
        return false;
      }

      return true;
    });

    const remaining = this.maxImages - this.selectedFiles.length;
    const filesToAdd = validFiles.slice(0, remaining);

    filesToAdd.forEach(file => {
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
        this.toastService.success(res.message ?? "Product images uploaded successfully");
        this.resetImageUploadForm()
      },
      error: (err) => {
        this.toastService.error(err?.error?.message ?? 'Image upload failed. Please try again.');
        this.isUploadingImages.set(false);
      }
    });
  }

  public finishSetup() {
    this.router.navigate(['/vendor/products']);
    this.toastService.success('Product setup completed successfully');
  }

  public addVariantRow(): void {
    this.variantRows.push({ name: '', value: '', priceAdjustment: null });
  }

  public removeVariantRow(index: number): void {
    this.variantRows.splice(index, 1);
  }

  public addAttributeRow(): void {
    this.attributeRows.push({ key: '', value: '' });
  }

  public removeAttributeRow(index: number): void {
    this.attributeRows.splice(index, 1);
  }
}
