import { Component, inject, signal } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { Address } from '../../services/address/address';
import { AddressData, GetAllAddressesResponse, GetDefaultAddressResponse } from '../../interfaces/address.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../services/toast/toast.service';
import { SkeletonLoader } from '../../shared/skeleton-loader/skeleton-loader';
import { finalize } from 'rxjs';
import { InputErrorMessage } from '../../shared/input-error-message/input-error-message';

@Component({
  selector: 'app-customer-location',
  imports: [Header, Footer, ReactiveFormsModule, SkeletonLoader, InputErrorMessage],
  templateUrl: './customer-location.html',
  styleUrl: './customer-location.css',
})
export class CustomerLocation {
  private readonly addressService = inject(Address);
  private readonly toastService = inject(ToastService);
  private readonly DEFAULT_PHONE_PREFIX = '+233 ';
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
    name: ['', [Validators.required, Validators.minLength(5)]],
    phone: [this.DEFAULT_PHONE_PREFIX, [Validators.required, Validators.pattern(/^\+233\s(?:2\d{2}|5\d{2})\s\d{3}\s\d{3}$/)]],
    landmark: ['', [Validators.required, Validators.minLength(5)]],
    addressLine: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', [Validators.required, Validators.minLength(3)]],
    region: ['', [Validators.required]],
    isDefault: [false],
  });

  ngOnInit() {
    this.loadAddresses();
  }

  public loadAddresses(): void {
    this.isAddressLoading.set(true);
    this.addressService.getDefaultAddress().subscribe({
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
    this.addressService.getAllAddresses().subscribe({
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
    this.addressForm.reset({
      phone: this.DEFAULT_PHONE_PREFIX,
      isDefault: this.addresses().length === 0,
    });
    this.view.set('form');
    this.scrollToTop();
  }

  public startEditAddress(address: AddressData) {
    this.editingId.set(address._id);
    this.addressForm.reset({
      name: address.name,
      phone: address.phone || this.DEFAULT_PHONE_PREFIX,
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

    const payload = {
      ...this.addressForm.getRawValue(),
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
    this.addressService.setAsDefaultAddress(addressId).subscribe({
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
      .deleteAddress(addressId)
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

  public onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;

    const digitsAfterPrefix = rawValue.replace('+233', '').replace(/\D/g, '').substring(0, 9);

    let formatted = '+233';
    if (digitsAfterPrefix.length > 0) formatted += ' ' + digitsAfterPrefix.substring(0, 3);
    if (digitsAfterPrefix.length > 3) formatted += ' ' + digitsAfterPrefix.substring(3, 6);
    if (digitsAfterPrefix.length > 6) formatted += ' ' + digitsAfterPrefix.substring(6, 9);

    this.addressForm.get('phone')?.setValue(formatted, { emitEvent: false });
    input.value = formatted;
    input.setSelectionRange(formatted.length, formatted.length);
  }

  public onPhoneKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && (input.selectionStart ?? 0) <= 5) {
      event.preventDefault();
    }
  }
}