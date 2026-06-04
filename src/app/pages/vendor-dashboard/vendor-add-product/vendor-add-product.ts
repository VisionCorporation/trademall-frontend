import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { fadeInOutAnimation } from '../../../animations/toast.animations';
import { ClickOutside } from '../../../directives/click-outside/click-outside';
import { Products } from '../../../services/products/products';
import { Category, RootCategory } from '../../../interfaces/categories.interface';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Attribute, CreateProductResponse, ProductDetailsPayload, UploadImagesResponse } from '../../../interfaces/products.interface';
import { FormStep } from '../../../types/add-product.type';
import { ToastService } from '../../../services/toast/toast.service';
import { Router } from '@angular/router';

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
  public step = signal<FormStep>('details');
  public createdProductId = signal<string | null>(null);
  public isSubmittingDetails = signal(false);
  public isUploadingImages = signal(false);
  public detailsError = signal<string | null>(null);
  public imagesError = signal<string | null>(null);
  public previewUrls: (string | null)[] = [];
  public selectedFiles: File[] = [];
  private taostService = inject(ToastService)
  private cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router)

  public productForm = {
    name: '',
    description: '',
    hasVariants: false,
    isPreOrder: false,
    preOrderDays: null as number | null,
    minPreOrderQuantity: null as number | null,
    price: 0,
    stockQuantity: 0,
    category: '',
  };

  constructor(private http: HttpClient) { }

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

  public buildPayload(): ProductDetailsPayload {
    const attributesObject = this.attributes.reduce<Record<string, string>>(
      (acc, attr) => {
        if (attr.name.trim() && attr.value.trim()) {
          const key = attr.name.trim().toLowerCase()
          const value = attr.value.trim().charAt(0).toUpperCase() + attr.value.trim().slice(1).toLowerCase()
          acc[key] = value;
        }
        return acc;
      },
      {}
    );
    const payload: ProductDetailsPayload = {
      name: this.productForm.name,
      description: this.productForm.description,
      attributes: attributesObject,
      hasVariants: this.productForm.hasVariants,

      isPreOrder: this.productForm.isPreOrder,
      ...(this.productForm.isPreOrder && {
        preOrderDays: this.productForm.preOrderDays ?? undefined,
        minPreOrderQuantity: this.productForm.minPreOrderQuantity ?? undefined,
      }),
      category: this.productForm.category,
      price: this.productForm.price,
      stockQuantity: this.productForm.stockQuantity,
    };

    return payload;
  }

  public get isFormValid(): boolean {
    return (
      this.productForm.name.trim() !== '' &&
      this.productForm.description.trim() !== '' &&
      this.productForm.price > 0 &&
      this.productForm.stockQuantity > 0 &&
      this.productForm.category !== '' &&
      this.attributes.every(attr => attr.name.trim() !== '' && attr.value.trim() !== '') &&
      (!this.productForm.isPreOrder || (
        (this.productForm.preOrderDays ?? 0) > 0 &&
        (this.productForm.minPreOrderQuantity ?? 0) > 0
      ))
    );
  }

  private resetForm(): void {
    this.productForm = {
      name: '',
      description: '',
      hasVariants: false,
      isPreOrder: false,
      preOrderDays: null,
      minPreOrderQuantity: null,
      price: 0,
      stockQuantity: 0,
      category: '',
    };

    this.attributes = [{ name: '', value: '' }];
    this.selectedFiles = [];
    this.previewUrls = [];
    this.selectedCategory = null;
    this.selectedSubCategory = null;
    this.createdProductId.set(null);
    this.step.set('details');
    this.detailsError.set(null);
    this.imagesError.set(null);
  }

  public addAttribute(): void {
    this.attributes.push({ name: '', value: '' });
  }

  public removeAttribute(index: number): void {
    if (this.attributes.length > 1) {
      this.attributes.splice(index, 1);
    }
  }

  public selectCategory(category: RootCategory) {
    this.selectedCategory = category;
    this.productForm.category = category._id;
    this.isCategoryOpen = false;
  }

  public submitDetails(payload: object) {
    this.isSubmittingDetails.set(true);
    this.detailsError.set(null);

    this.http.post<CreateProductResponse>(`${environment.apiBaseUrl}/products`, payload).subscribe({
      next: (res) => {
        this.createdProductId.set(res.data._id);
        this.step.set('images');
        this.taostService.success(res.message);
        this.isSubmittingDetails.set(false);
      },
      error: (err) => {
        this.taostService.error('Failed to save product. Please try again.');
        this.detailsError.set(err?.error?.message ?? 'Failed to save product. Please try again.');
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
    const id = this.createdProductId();
    if (!id || this.selectedFiles.length === 0) return;

    this.isUploadingImages.set(true);
    this.imagesError.set(null);

    const formData = new FormData();
    this.selectedFiles.forEach(file => formData.append('images', file));

    this.http.post<UploadImagesResponse>(`${environment.apiBaseUrl}/products/${id}/images`, formData).subscribe({
      next: (res) => {
        this.isUploadingImages.set(false);
        this.taostService.success(res.message);
        this.resetForm();
        this.router.navigate(['/vendor/products']);
      },
      error: (err) => {
        this.taostService.error(err?.error?.message ?? 'Image upload failed. Please try again.');
        this.imagesError.set(err?.error?.message ?? 'Image upload failed. Please try again.');
        this.isUploadingImages.set(false);
      }
    });
  }
}
