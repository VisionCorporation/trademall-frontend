import { Component, computed, inject, signal } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { Address } from '../../services/address/address';
import { LoginService } from '../../services/login/login.service';
import { AddressData, GetAllAddressesResponse, GetDefaultAddressResponse } from '../../interfaces/address.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../services/toast/toast.service';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-customer-location',
  imports: [Header, Footer, ReactiveFormsModule, SkeletonLoader],
  templateUrl: './customer-location.html',
  styleUrl: './customer-location.css',
})
export class CustomerLocation {
  private userId = ''
  private readonly addressService = inject(Address);
  private readonly loginService = inject(LoginService);
  private readonly toastService = inject(ToastService);
  public isAddressLoading = signal(false);
  public areAddressesLoading = signal(false);
  public isSaving = signal(false);
  public deletingAddressId = signal<string | null>(null);
  private fb = inject(FormBuilder);

  public view = signal<'summary' | 'manage' | 'form'>('summary');
  public addresses = signal<AddressData[]>([]);
  public defaultAddress = signal<AddressData | null>(null);
  public editingId = signal<string | null>(null);

  public addressForm = this.fb.group({
    landmark: ['', Validators.required],
    addressLine: ['', Validators.required],
    city: ['', Validators.required],
    region: ['', Validators.required],
    isDefault: [false],
  });

  ngOnInit() {
    const user = this.loginService.getCurrentUser();
    this.userId = user._id;
    this.loadAddresses();
  }

  public loadAddresses(): void {
    this.isAddressLoading.set(true);
    this.addressService.getDefaultAddress(this.userId).subscribe({
      next: (res: GetDefaultAddressResponse) => {
        this.defaultAddress.set(res.data);
        this.isAddressLoading.set(false);
      },
      error: (error) => {
        this.toastService.error('Error fetching default address: ' + error.message);
        this.defaultAddress.set(null);
        this.isAddressLoading.set(false);
      },
    });

    this.areAddressesLoading.set(true);
    this.addressService.getAllAddresses(this.userId).subscribe({
      next: (res: GetAllAddressesResponse) => {
        this.addresses.set(Array.isArray(res.data) ? res.data : []);
        this.areAddressesLoading.set(false);
      },
      error: (error) => {
        this.toastService.error('Error fetching addresses: ' + error.message);
        this.addresses.set([]);
        this.areAddressesLoading.set(false);
      },
    });
  }

  public goToSummary() {
    this.view.set('summary');
    this.scrollToTop();
  }

  public goToManage() {
    this.view.set('manage');
    this.scrollToTop();
  }

  public startAddAddress() {
    this.editingId.set(null);
    this.addressForm.reset({ isDefault: this.addresses().length === 0 });
    this.view.set('form');
    this.scrollToTop();
  }

  public startEditAddress(address: AddressData) {
    this.editingId.set(address._id);
    this.addressForm.reset({
      landmark: address.landmark,
      addressLine: address.addressLine,
      city: address.city,
      region: address.region,
      isDefault: address.isDefault,
    });

    this.view.set('form');
    this.scrollToTop();
  }

  public cancelForm() {
    this.view.set(this.addresses().length > 0 ? 'manage' : 'summary');
    this.scrollToTop();
  }

  public saveAddress() {
    if (this.addressForm.invalid) return;

    this.isSaving.set(true);

    const user = this.loginService.getCurrentUser();
    const payload = {
      ...this.addressForm.getRawValue(),
      name: user.firstName + ' ' + user.lastName,
      phone: user.phoneNumber,
      userId: user._id,
    };

    const request$ = this.editingId()
      ? this.addressService.updateAddress(this.editingId()!, payload)
      : this.addressService.createNewAddress(payload);

    request$.subscribe({
      next: () => {
        this.toastService.success(`Address ${this.editingId() ? 'updated' : 'added'} successfully!`);
        this.loadAddresses();
        this.view.set('manage');
        this.scrollToTop();
        this.addressForm.reset({ isDefault: this.addresses().length === 0 });
        this.isSaving.set(false);
      },
      error: (error) => {
        this.toastService.error('Error saving address: ' + error.message);
        this.isSaving.set(false);
      }
    });
  }

  public setAsDefault(addressId: string) {
    this.addressService.setAsDefaultAddress(addressId, this.userId).subscribe({
      next: () => {
        this.loadAddresses();
        this.toastService.success('Default address updated successfully!');
        this.view.set('summary');
        this.scrollToTop();
      },
      error: (error) => {
        this.toastService.error('Error setting default address: ' + error.message);
      }
    });
  }

  public deleteAddress(addressId: string) {
    this.deletingAddressId.set(addressId);

    this.addressService
      .deleteAddress(addressId, this.userId)
      .pipe(
        finalize(() => this.deletingAddressId.set(null))
      )
      .subscribe({
        next: () => {
          this.toastService.success('Address deleted successfully!');
          this.loadAddresses();
          this.scrollToTop();
        },
        error: (error) => {
          this.toastService.error('Error deleting address: ' + error.message);
        }
      });
  }

  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}