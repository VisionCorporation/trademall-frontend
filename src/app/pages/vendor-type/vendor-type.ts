import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VendorTypes } from '../../data/constants/vendor-type.constant';
import { SignupService } from '../../services/signup/signup.service';
import { VendorSignupData } from '../../interfaces/signup.interface';
import { ToastService } from '../../services/toast/toast.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-vendor-type',
  imports: [ReactiveFormsModule, RouterLink, AsyncPipe],
  templateUrl: './vendor-type.html',
  styleUrl: './vendor-type.css',
})
export class VendorType {
  public vendorTypes = VendorTypes;
  private fb = inject(FormBuilder);
  public signupService = inject(SignupService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  public vendorTypeForm = this.fb.group({
    vendorType: [''],
  });

  ngAfterViewInit(): void {
    this.vendorTypeForm.get('vendorType')?.valueChanges.subscribe((value) => {
      this.vendorTypeForm.get('vendorType')?.setValue(value, { emitEvent: false });
    });
  }

  public selectVendorType(vendorType: string): void {
    this.vendorTypeForm.get('vendorType')?.setValue(vendorType);
  }

  public registerVendor(): void {
    const savedData = this.signupService.getVendorFormData();

    if (
      !savedData?.userId ||
      !savedData?.firstName ||
      !savedData?.lastName ||
      !savedData?.phoneNumber ||
      !savedData?.password ||
      !savedData?.confirmPassword
    ) {
      this.toastService.error('Incomplete signup data. Please start over.');
      this.router.navigate(['/vendor/signup']);
      return;
    }

    const vendorType = this.vendorTypeForm.value.vendorType;
    if (!vendorType) {
      this.toastService.error('Please select a vendor type.');
      return;
    }

    const vendorData: VendorSignupData = {
      userId: savedData.userId,
      firstName: savedData.firstName,
      lastName: savedData.lastName,
      phoneNumber: savedData.phoneNumber,
      password: savedData.password,
      confirmPassword: savedData.confirmPassword,
      vendorType,
    };

    this.signupService.isSubmitting$.next(true);

    this.signupService.registerVendor(vendorData).subscribe({
      next: () => {
        this.signupService.isSubmitting$.next(false);
        this.toastService.success('Account registered successfully. Log in now.');
        this.signupService.resetAfterSuccess();
        this.signupService.clearVendorFormData();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.signupService.isSubmitting$.next(false);
        this.toastService.error(`${err.error.message || 'Failed to register. Try again later.'}`);
      },
    });
  }

  public onSubmit(): void {
    const selectVendorType = this.vendorTypeForm.get('vedorType')?.value;
  }
}
