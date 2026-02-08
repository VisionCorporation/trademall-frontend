import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  OtpSuccessResponse,
  SignupData,
  VendorSignupData,
} from '../../interfaces/signup.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  public currentStep = 1;
  public isSubmitting$ = new BehaviorSubject<boolean>(false);
  public isResending$ = new BehaviorSubject<boolean>(false);
  public signingWithGoogle$ = new BehaviorSubject<boolean>(false);
  private vendorFormData: Partial<VendorSignupData> | null = null;

  public emailForm = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
    ],
  });

  public otpForm = this.fb.group({
    digit1: ['', [Validators.required]],
    digit2: ['', [Validators.required]],
    digit3: ['', [Validators.required]],
    digit4: ['', [Validators.required]],
    digit5: ['', [Validators.required]],
    digit6: ['', [Validators.required]],
  });

  public personalForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: [
      '+233 ',
      [Validators.required, Validators.pattern(/^\+233\s(?:2\d{2}|5\d{2})\s\d{3}\s\d{3}$/)],
    ],
  });

  public passwordForm = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator },
  );

  private passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  public setVendorFormData(data: Partial<VendorSignupData>): void {
    this.vendorFormData = data;
  }

  public getVendorFormData(): Partial<VendorSignupData> | null {
    return this.vendorFormData;
  }

  public clearVendorFormData() {
    this.vendorFormData = null;
  }

  public nextStep(): void {
    this.currentStep++;
  }

  public submitCustomerEmailForOtp(email: string): Observable<string> {
    return this.http.post<string>(`${environment.apiBaseUrl}/user/signup/stage1`, { email });
  }

  public verifyCustomerOtp(email: string, otp: string): Observable<OtpSuccessResponse> {
    return this.http.post<OtpSuccessResponse>(`${environment.apiBaseUrl}/user/signup/stage2`, {
      email,
      otp,
    });
  }

  public registerCustomer(formData: SignupData): Observable<Object> {
    return this.http.post<Object>(`${environment.apiBaseUrl}/user/signup/stage3`, formData);
  }

  public submitVendorEmailForOtp(email: string): Observable<string> {
    return this.http.post<string>(`${environment.apiBaseUrl}/vendor/signup/stage1`, { email });
  }

  public verifyVendorOtp(email: string, otp: string): Observable<OtpSuccessResponse> {
    return this.http.post<OtpSuccessResponse>(`${environment.apiBaseUrl}/vendor/signup/stage2`, {
      email,
      otp,
    });
  }

  public registerVendor(formData: VendorSignupData): Observable<Object> {
    return this.http.post<Object>(`${environment.apiBaseUrl}/vendor/signup/stage3`, formData);
  }

  public resendOtp(email: string) {
    return this.http.post<string>(`${environment.apiBaseUrl}/user/resend-otp`, { email });
  }

  public formatPhoneNumber(): void {
    const control = this.personalForm.get('phoneNumber');
    if (control) {
      let value = control.value;
      if (value && value.startsWith('+233')) {
        const cleaned = value.replace(/\s/g, '');
        if (cleaned.startsWith('+233')) {
          const digits = cleaned.substring(4);
          const formatted = digits.replace(/(\d{3})(?=\d)/g, '$1 ');
          value = '+233 ' + formatted;
          control.setValue(value, { emitEvent: false });
        }
      }
    }
  }

  public resetAfterSuccess(): void {
    this.emailForm.reset();
    this.otpForm.reset();
    this.personalForm.reset();
    this.passwordForm.reset();
  }
}
