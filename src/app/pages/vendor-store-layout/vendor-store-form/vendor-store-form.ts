import { Component, inject, OnInit, signal } from '@angular/core';
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
  public step = signal<'store-details' | 'store-location'>('store-details');
  public isSubmittingDetails = signal(false);
  public isSubmittingLocation = signal(false);
  public isLoadingStoreDetails = signal(false);
  public isLoadingStoreLocation = signal(false);
  public regions = REGIONS;

  public detailsForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    subdomain: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)
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
        Validators.required,
        Validators.pattern(/^[A-Z]{2}-\d{3}-\d{4}$/i)
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
            res.message ?? 'Store setup completed successfully'
          );

          this.router.navigate(['/vendor/store']);
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
}