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
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DropdownOverlay } from '../../../shared/directives/dropdown-overlay/dropdown-overlay';
import { AttributeRow, ProductVariant, ProductVariation } from '../../../interfaces/vendor-dashboard.interface';

@Component({
  selector: 'app-vendor-add-product',
  imports: [FormsModule, DropdownOverlay],
  templateUrl: './vendor-add-product.html',
  styleUrl: './vendor-add-product.css',
  animations: [fadeInOutAnimation]
})
export class VendorAddProduct implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  public hasVariants = false;
  public variationRows: ProductVariation[] = [];
  public variantRows: ProductVariant[] = [];
  public newOptionInputs: Record<number, string> = {};
  public attributeRows: AttributeRow[] = [{ key: '', value: '' }];
  private rawCategoryTree: RootCategory[] = [];
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
  };

  public productAdvancedDetailsForm: ProductGeneralDetailsPayload = {
    name: '',
    description: '',
    price: null as number | null,
    category: '',
    brand: '',
    isPreOrder: false,
    hasVariants: false,
  };

  ngOnInit() {
    this.fetchCategories()
  }

  public fetchCategories() {
    this.isCategoryLoading.set(true);
    this.hasCategoryFailed.set(false);

    this.categoryService.getCategoryHierarchy().subscribe({
      next: (response) => {
        this.rawCategoryTree = response.data;
        this.categories.set(this.sortCategories(response.data));
        this.isCategoryLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.hasCategoryFailed.set(true);
        this.isCategoryLoading.set(false);
      },
    });
  }

  public selectCategory(category: RootCategory) {
    this.selectedCategory = category;
    this.selectedSubCategory = null;
    this.isCategoryOpen = false;
    this.deriveSubCategories();
  }

  public selectSubCategory(subCategory: Category) {
    this.selectedSubCategory = subCategory;
    this.productGeneralDetailsForm.category = subCategory._id;
    this.isSubCategoryOpen = false;
  }

  public fetchSubCategories() {
    this.deriveSubCategories();
  }

  private deriveSubCategories(): void {
    if (!this.selectedCategory) return;

    this.isSubCategoryLoading.set(true);
    this.hasSubCategoryFailed.set(false);

    const matchedCategory = this.rawCategoryTree.find(
      (c) => c._id === this.selectedCategory!._id
    );

    if (!matchedCategory) {
      this.hasSubCategoryFailed.set(true);
      this.isSubCategoryLoading.set(false);
      return;
    }

    const leaves = this.getLeafCategories(matchedCategory.children ?? []);
    this.subCategories.set(this.sortCategories(leaves));
    this.isSubCategoryLoading.set(false);
  }

  private getLeafCategories(categories: Category[]): Category[] {
    const leaves: Category[] = [];
    for (const category of categories) {
      if (!category.children || category.children.length === 0) {
        leaves.push(category);
      } else {
        leaves.push(...this.getLeafCategories(category.children));
      }
    }
    return leaves;
  }

  private sortCategories<T extends { displayOrder: number }>(list: T[]): T[] {
    return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public buildPayload() {
    const payload = {
      name: this.productGeneralDetailsForm.name,
      description: this.productGeneralDetailsForm.description,
      price: this.productGeneralDetailsForm.price,
      category: this.productGeneralDetailsForm.category,
    };

    return payload;
  }

  public get isFormValid(): boolean {
    return (
      this.productGeneralDetailsForm.name.trim() !== '' &&
      this.productGeneralDetailsForm.description.trim() !== '' &&
      this.productGeneralDetailsForm.price !== null &&
      this.productGeneralDetailsForm.category !== ''
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
    if (!productId || this.selectedFiles.length === 0) {
      this.toastService.error("Something went wrong. We couldn't find the product ID.");
      return
    }

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

  private saveVariants(productId: string): Observable<any> {
    if (this.variantRows.length === 0) return of(null);
    return this.vendorDashbaordService.submitProductVariants(productId, this.serializeVariants());
  }

  private saveVariantsIfNeeded(productId: string): Observable<any> {
    if (!this.hasVariants || this.variationRows.length === 0) return of(null);
    return this.vendorDashbaordService.submitProductVariations(productId, this.serializeVariations()).pipe(
      switchMap(() => this.saveVariants(productId))
    );
  }

  public finishSetup() {
    const productId = this.createdProductId();
    if (!productId) {
      this.toastService.error("Something went wrong. We couldn't find the product ID.");
      return;
    }

    this.isFinishingSetup.set(true);

    const advancedDetails$: Observable<any> = this.hasAdvancedDetails()
      ? this.vendorDashbaordService.submitProductAdvancedDetails(productId, this.serializeAdvancedDetails())
      : of(null);

    advancedDetails$.pipe(
      switchMap(() => this.saveVariantsIfNeeded(productId))
    ).subscribe({
      next: (res) => {
        this.isFinishingSetup.set(false);
        console.log(res)
        this.router.navigate(['/vendor/products']);
        this.toastService.success('Product setup completed successfully');
      },
      error: (err) => {
        this.isFinishingSetup.set(false);
        console.log(err)
        this.toastService.error(err?.error?.message ?? 'Failed to save product details. Please try again.');
      }
    });
  }

  public addVariationRow() {
    this.variationRows.push({
      name: '', type: 'select', options: [], required: true, displayOrder: this.variationRows.length
    });
  }

  public removeVariationRow(index: number) {
    const removedName = this.variationRows[index]?.name;
    this.variationRows.splice(index, 1);
    this.variationRows.forEach((v, i) => (v.displayOrder = i));
    this.variantRows.forEach(variant => {
      delete variant.variationValues[removedName];
    });
  }

  public addVariationOption(variationIndex: number) {
    const value = this.newOptionInputs[variationIndex]?.trim();
    if (!value) return;
    const variation = this.variationRows[variationIndex];
    if (!variation.options.includes(value)) {
      variation.options.push(value);
    }
    this.newOptionInputs[variationIndex] = '';
  }

  public removeVariationOption(variationIndex: number, option: string): void {
    const variation = this.variationRows[variationIndex];
    if (!variation) {
      return;
    }
    variation.options = variation.options.filter(o => o !== option);
  }

  public canAddVariant(): boolean {
    return this.variationRows.length > 0 &&
      this.variationRows.every(v => v.name && v.options.length > 0);
  }

  public addVariantRow() {
    if (!this.canAddVariant()) return;
    const variationValues: Record<string, string> = {};
    this.variationRows.forEach(v => (variationValues[v.name] = v.options[0]));
    this.variantRows.push({
      variationValues, sku: '', price: null, stockQuantity: null,
      lowStockThreshold: null, isActive: true, weight: null, image: null
    });
  }

  public setVariantValue(variantIndex: number, variationName: string, value: string) {
    this.variantRows[variantIndex].variationValues[variationName] = value;
  }

  public removeVariantRow(index: number) {
    this.variantRows.splice(index, 1);
  }

  private serializeVariations() {
    return this.variationRows.map(({ name, type, options, required, displayOrder }) => ({
      name, type, options, required, displayOrder
    }));
  }

  private serializeVariants() {
    return this.variantRows.map(v => {
      const payload: any = {
        variationValues: v.variationValues,
        sku: v.sku,
        price: v.price ?? 0,
        stockQuantity: v.stockQuantity ?? 0,
        lowStockThreshold: v.lowStockThreshold ?? 0,
        isActive: v.isActive,
        weight: v.weight ?? 0
      };
      if (v.image?.url) payload.image = v.image;
      return payload;
    });
  }

  public addAttributeRow(): void {
    this.attributeRows.push({ key: '', value: '' });
  }

  public removeAttributeRow(index: number): void {
    this.attributeRows.splice(index, 1);
  }

  private hasAdvancedDetails(): boolean {
    const f = this.productAdvancedDetailsForm;
    const hasFilledAttribute = this.attributeRows.some(a => a.key.trim() && a.value.trim());
    return !!(
      f.brand?.trim() ||
      f.salePrice != null ||
      f.weight != null ||
      f.stockQuantity != null ||
      f.lowStockThreshold != null ||
      f.isPreOrder ||
      hasFilledAttribute
    );
  }

  private serializeAdvancedDetails() {
    const f = this.productAdvancedDetailsForm;
    const payload: any = {};

    if (f.brand?.trim()) payload.brand = f.brand.trim();
    if (f.salePrice != null) payload.salePrice = f.salePrice;
    if (f.weight != null) payload.weight = f.weight;
    if (f.stockQuantity != null) payload.stockQuantity = f.stockQuantity;
    if (f.lowStockThreshold != null) payload.lowStockThreshold = f.lowStockThreshold;
    if (f.isPreOrder) {
      payload.isPreOrder = true;
      payload.preOrderDays = f.preOrderDays;
      payload.minPreOrderQuantity = f.minPreOrderQuantity;
      payload.preOrderShippingFee = f.preOrderShippingFee;
    }

    const attributes = this.attributeRows
      .filter(a => a.key.trim() && a.value.trim())
      .reduce((acc, a) => ({ ...acc, [a.key.trim()]: a.value.trim() }), {});
    if (Object.keys(attributes).length > 0) payload.attributes = attributes;

    return payload;
  }
}
