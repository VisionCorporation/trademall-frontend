import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { STORE_SETUP_STEPS } from '../../../data/constants/vendor-dashbaord.constant';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { REGIONS } from '../../../data/constants/address.constant';
import { InputErrorMessage } from '../../../shared/input-error-message/input-error-message';
import { VendorStoreService } from '../../../services/vendor-store/vendor-store';
import { ToastService } from '../../../services/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-vendor-store-form',
  imports: [ReactiveFormsModule, InputErrorMessage],
  templateUrl: './vendor-store-form.html',
  styleUrl: './vendor-store-form.css',
})

export class VendorStoreForm implements OnInit {
  public storeSetupSteps = STORE_SETUP_STEPS;
  private readonly vendorStoreService = inject(VendorStoreService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  public step = signal<'store-details' | 'store-location' | 'store-logo' | 'store-banner'>('store-details');
  public isSubmittingDetails = signal(false);
  public isSubmittingLocation = signal(false);
  public isLoadingStoreDetails = signal(false);
  public isLoadingStoreLocation = signal(false);
  public regions = REGIONS;

  public isSubmittingLogo = signal(false);
  public isSubmittingBanner = signal(false);
  public logoFile = signal<File | null>(null);
  public bannerFile = signal<File | null>(null);
  public logoPreview = signal<string | null>(null);
  public bannerPreview = signal<string | null>(null);
  public existingLogo = signal<string | null>(null);
  public existingBanner = signal<string | null>(null);

  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  public detailsForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    subdomain: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/i)
      ]
    ],
    description: ['', Validators.required],
    shippingPolicy: ['', Validators.required],
    returnPolicy: ['', Validators.required],
    termsAndConditions: ['', Validators.required],
  });

  public locationForm = this.fb.nonNullable.group({
    region: ['', Validators.required],
    city: ['', Validators.required],
    digitalAddress: [
      '',
      [
        Validators.required
      ]
    ],
    physicalAddress: ['', Validators.required],
  });

  ngOnInit(): void {
    const mode = this.route.snapshot.routeConfig?.path;

    if (mode === 'edit') {
      this.getStoreDetails();
    }
  }

  public showError(form: FormGroup, control: string) {
    const c = form.get(control);

    return !!c && c.invalid && (c.touched || c.dirty);
  }

  public getStoreDetails(): void {
    this.isLoadingStoreDetails.set(true);
    this.vendorStoreService.getPublicStorePage('nastrade').subscribe({
      next: (res) => {
        const store = res.store;
        this.detailsForm.patchValue({
          name: store.name,
          subdomain: store.subdomain,
          description: store.description,
          shippingPolicy: store.shippingPolicy,
          returnPolicy: store.returnPolicy,
          termsAndConditions: store.termsAndConditions,
        });
        this.isLoadingStoreDetails.set(false);

        this.locationForm.patchValue({
          region: store.region,
          city: store.city,
        });

        this.existingLogo.set(store.logo);
        this.existingBanner.set(store.banner);
      },
      error: (err) => {
        console.error('Failed to fetch store details', err);
      }
    });
  }

  public submitStoreDetails() {
    this.isSubmittingDetails.set(true);

    this.vendorStoreService.submitOrUpdateStoreDetails(this.detailsForm.getRawValue()).subscribe({
      next: (res) => {
        this.isSubmittingDetails.set(false);
        this.toastService.success(res.message ?? 'Store details submitted successfully');
        this.step.set('store-location');
        this.detailsForm.reset();
      }
      ,
      error: (err) => {
        this.isSubmittingDetails.set(false);
        console.error('Failed to submit store details', err);
        this.toastService.error(err.error.message ?? 'Failed to submit store details');
      }
    });

  }

  public submitStoreLocation(): void {
    this.isSubmittingLocation.set(true);

    this.vendorStoreService
      .submitStoreLocation(this.locationForm.getRawValue())
      .subscribe({
        next: (res) => {
          this.isSubmittingLocation.set(false);

          this.toastService.success(
            res.message ?? 'Store location saved successfully'
          );

          this.step.set('store-logo');
        },
        error: (err) => {
          this.isSubmittingLocation.set(false);

          console.error('Failed to submit store location', err);

          this.toastService.error(
            err.error?.message ?? 'Failed to submit store location'
          );
        }
      });
  }

  public onLogoSelected(event: Event): void {
    this.pickImage(event, this.logoFile, this.logoPreview);
  }

  public onBannerSelected(event: Event): void {
    this.pickImage(event, this.bannerFile, this.bannerPreview);
  }

  public clearLogo(): void {
    this.clearImage(this.logoFile, this.logoPreview);
  }

  public clearBanner(): void {
    this.clearImage(this.bannerFile, this.bannerPreview);
  }

  public skipLogo(): void {
    this.step.set('store-banner');
  }

  public submitStoreLogo(): void {
    const file = this.logoFile();
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    this.isSubmittingLogo.set(true);
    this.vendorStoreService.submitStoreLogo(formData).subscribe({
      next: () => {
        this.isSubmittingLogo.set(false);
        this.toastService.success('Logo uploaded successfully');
        this.step.set('store-banner');
      },
      error: (err) => {
        this.isSubmittingLogo.set(false);
        console.error('Failed to upload store logo', err);
        this.toastService.error(err.error?.message ?? 'Failed to upload logo');
      },
    });
  }

  public submitStoreBanner(): void {
    const file = this.bannerFile();
    if (!file) return;

    const formData = new FormData();
    formData.append('banner', file);

    this.isSubmittingBanner.set(true);
    this.vendorStoreService.submitStoreBanner(formData).subscribe({
      next: () => {
        this.isSubmittingBanner.set(false);
        this.toastService.success('Banner uploaded successfully');
        this.finishSetup();
      },
      error: (err) => {
        this.isSubmittingBanner.set(false);
        console.error('Failed to upload store banner', err);
        this.toastService.error(err.error?.message ?? 'Failed to upload banner');
      },
    });
  }

  public finishSetup(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    const destination =
      returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
        ? returnUrl
        : '/vendor/store';

    this.router.navigateByUrl(destination);
  }

  private pickImage(
    event: Event,
    file: WritableSignal<File | null>,
    preview: WritableSignal<string | null>,
  ): void {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0];
    input.value = '';

    if (!selected) return;

    if (!this.ALLOWED_IMAGE_TYPES.includes(selected.type)) {
      this.toastService.error('Please choose a PNG, JPG or WebP image');
      return;
    }

    if (selected.size > this.MAX_IMAGE_SIZE) {
      this.toastService.error('Image must be 5MB or smaller');
      return;
    }

    const previous = preview();
    if (previous) URL.revokeObjectURL(previous);

    file.set(selected);
    preview.set(URL.createObjectURL(selected));
  }

  private clearImage(file: WritableSignal<File | null>, preview: WritableSignal<string | null>): void {
    const previous = preview();
    if (previous) URL.revokeObjectURL(previous);

    file.set(null);
    preview.set(null);
  }
}