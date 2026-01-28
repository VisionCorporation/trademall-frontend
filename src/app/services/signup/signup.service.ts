import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { SignupData } from '../../interfaces/signup.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  public currentStep = 1;
  public isSubmitting$ = new BehaviorSubject<boolean>(false);
  public isVerifying$ = new BehaviorSubject<boolean>(false);

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

  public nextStep(): Observable<any> | null {
    if (this.currentStep === 1 && this.emailForm.valid) {
      this.saveToLocalStorage();
      this.currentStep++;
      return null;
    } else if (this.currentStep === 2 && this.personalForm.valid) {
      this.saveToLocalStorage();
      this.currentStep++;
      return null;
    } else if (this.currentStep === 4 && this.passwordForm.valid) {
      this.saveToLocalStorage();
      // return this.submitForm();
    }
    return null;
  }

  public goToStep(step: number) {
    if (step <= this.currentStep) {
      this.currentStep = step;
    }
  }

  private saveToLocalStorage() {
    const data = {
      email: this.emailForm.value.email,
      firstName: this.personalForm.value.firstName,
      lastName: this.personalForm.value.lastName,
      phoneNumber: this.personalForm.value.phoneNumber,
      password: this.passwordForm.value.password,
      confirmPassword: this.passwordForm.value.confirmPassword,
      currentStep: this.currentStep,
    };
    localStorage.setItem('customerSignup', JSON.stringify(data));
  }

  private loadFromLocalStorage() {
    const data = localStorage.getItem('customerSignup');
    if (data) {
      const parsed = JSON.parse(data);
      this.emailForm.patchValue({ email: parsed.email });
      this.personalForm.patchValue({
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        phoneNumber: parsed.phoneNumber,
      });
      this.passwordForm.patchValue({
        password: parsed.password,
        confirmPassword: parsed.confirmPassword,
      });
      this.currentStep = parsed.currentStep || 1;
    }
  }

  // private submitForm(): Observable<any> {
  //   const formData = {
  //     email: this.emailForm.value.email,
  //     firstName: this.personalForm.value.firstName,
  //     lastName: this.personalForm.value.lastName,
  //     phoneNumber: this.personalForm.value.phoneNumber,
  //     password: this.passwordForm.value.password,
  //     confirmPassword: this.passwordForm.value.confirmPassword,
  //   };

  //   return this.submitCustomerSignup(formData as SignupData);
  // }

  public submitCustomerEmailForOtp(email: string) {
    return this.http.post<string>(`${environment.apiBaseUrl}/user/signup/stage1`, { email });
  }

  // public verifyCustomerOtp(email: string, otp: string) {
  //   return this.http.post<string>(`${environment.apiBaseUrl}/user/signup/stage2`, {
  //     email,
  //     otp,
  //   });
  // }

  // public registerCustomer(formData: SignupData): Observable<SignupData> {
  //   return this.http.post<SignupData>(`${environment.apiBaseUrl}/user/signup/stage3`, formData);
  // }

  public emailErrorMessage(): string {
    const control = this.emailForm.get('email');
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return 'Email is required';
      if (control.errors?.['pattern']) return 'Invalid email (e.g., user@domain.com)';
    }
    return '';
  }

  public phoneErrorMessage(): string {
    const control = this.personalForm.get('phoneNumber');
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return 'Phone number is required';
      if (control.errors?.['pattern']) return 'Invalid phone number (e.g., +233 245 678 901)';
    }
    return '';
  }

  public passwordErrorMessage(): string {
    const control = this.passwordForm.get('password');
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return 'Password is required';
      if (control.errors?.['minlength']) return 'Password must be 6+ characters';
    }
    return '';
  }

  public confirmPasswordErrorMessage(): string {
    const control = this.passwordForm.get('confirmPassword');
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return 'Confirm password is required';
      if (control.errors?.['mismatch']) return 'Passwords do not match';
    }
    return '';
  }

  public formatPhoneNumber() {
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

  public resetAfterSuccess() {
    localStorage.removeItem('customerSignup');
    this.emailForm.reset();
    this.personalForm.reset();
    this.passwordForm.reset();
    this.currentStep = 1;
  }

  public initialize() {
    this.loadFromLocalStorage();
  }
}
