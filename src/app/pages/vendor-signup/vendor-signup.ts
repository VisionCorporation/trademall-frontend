import { Component, ElementRef, inject, QueryList, ViewChildren } from '@angular/core';
import { SignupService } from '../../services/signup/signup.service';
import { ToastService } from '../../services/toast/toast.service';
import { Observable, Subscription } from 'rxjs';
import { CountdownTimerService } from '../../services/countdown-timer/coutdown-timer.service';
import { Router, RouterLink } from '@angular/router';
import { otpControls, steps } from '../../data/constants/signup.constant';
import {
  OtpSuccessResponse,
  SignupData,
  VendorSignupData,
} from '../../interfaces/signup.interface';
import { environment } from '../../../environments/environment';
import { ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { InputErrorMessage } from '../../shared/input-error-message/input-error-message';

@Component({
  selector: 'app-vendor-signup',
  imports: [RouterLink, ReactiveFormsModule, AsyncPipe, InputErrorMessage],
  templateUrl: './vendor-signup.html',
  styleUrl: './vendor-signup.css',
})
export class VendorSignup {
  public signupService = inject(SignupService);
  private toastService = inject(ToastService);
  private subscription = new Subscription();
  private userId = '';
  public countdown$!: Observable<string>;
  public canResend$!: Observable<boolean>;
  private readonly countdownTimerService = inject(CountdownTimerService);
  private TIMER_KEY = 'otp_expiry';
  private router = inject(Router);
  public steps = steps;
  public otpControls = otpControls;

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  ngOnInit(): void {
    this.countdownTimerService.clear(this.TIMER_KEY);
  }

  ngAfterViewInit(): void {
    if (this.signupService.currentStep === 2) {
      this.otpInputs.first?.nativeElement.focus();
    }
  }

  get currentStep() {
    return this.signupService.currentStep;
  }

  get emailForm() {
    return this.signupService.emailForm;
  }

  public submitEmailForOtp(): void {
    this.signupService.isSubmitting$.next(true);

    const email = this.emailForm.value.email || '';

    this.signupService.submitVendorEmailForOtp(email).subscribe({
      next: () => {
        this.initTimer();
        this.signupService.isSubmitting$.next(false);
        this.toastService.success('OTP code sent successfully to your email.');
        this.signupService.nextStep();
        this.otpInputs.first.nativeElement.focus();
      },
      error: (err) => {
        this.signupService.isSubmitting$.next(false);
        this.toastService.error(
          `${err.error.message || 'Failed to submit email. Try again later.'}`,
        );
      },
    });
  }

  public verifyOtpCode(): void {
    this.signupService.isSubmitting$.next(true);

    const email = this.emailForm.value.email || '';
    const otp = Object.values(this.otpForm.value).join('');

    this.signupService.verifyVendorOtp(email, otp).subscribe({
      next: (res: OtpSuccessResponse) => {
        this.signupService.isSubmitting$.next(false);
        this.toastService.success('Email verified successfully.');
        this.countdownTimerService.clear(this.TIMER_KEY);
        this.userId = res.userId;
        this.signupService.nextStep();
      },
      error: (err) => {
        this.signupService.isSubmitting$.next(false);
        this.toastService.error(
          `${err.error.message || 'Failed to verify email. Try again later.'}`,
        );
      },
    });
  }

  private initTimer(): void {
    const { time$, finished$ } = this.countdownTimerService.start(this.TIMER_KEY, 120);
    this.countdown$ = time$;
    this.canResend$ = finished$;
  }

  public resendOtp(): void {
    this.signupService.isResending$.next(true);

    this.signupService.resendOtp(this.emailForm.value.email || '').subscribe({
      next: () => {
        this.signupService.isResending$.next(false);
        this.toastService.success('OTP code resent successfully to your email.');
        this.countdownTimerService.clear(this.TIMER_KEY);
        this.initTimer();
        this.signupService.otpForm.reset();
        this.otpInputs.first.nativeElement.focus();
      },
      error: (err) => {
        this.toastService.error(`${err.error.message || 'Failed to resend OTP. Try again later.'}`);
      },
    });
  }

  public signInWithGoogle(): void {
    if (this.signupService.signingWithGoogle$.value) return;

    this.signupService.signingWithGoogle$.next(true);
    window.location.href = `${environment.apiBaseUrl}/user/google`;
  }

  public onProceed() {
    const formData: Partial<VendorSignupData> = {
      userId: this.userId,
      firstName: this.personalForm.value.firstName ?? '',
      lastName: this.personalForm.value.lastName ?? '',
      phoneNumber: this.personalForm.value.phoneNumber ?? '',
      password: this.passwordForm.value.password ?? '',
      confirmPassword: this.passwordForm.value.confirmPassword ?? '',
    };

    this.signupService.setVendorFormData(formData);
    this.router.navigate(['/vendor-type']);
  }

  get otpForm() {
    return this.signupService.otpForm;
  }

  get personalForm() {
    return this.signupService.personalForm;
  }

  get passwordForm() {
    return this.signupService.passwordForm;
  }

  public nextStep(): void {
    this.signupService.nextStep();
  }

  public formatPhoneNumber(): void {
    this.signupService.formatPhoneNumber();
  }

  public onPhoneNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!value.startsWith('+233 ')) {
      input.value = '+233 ';
      this.signupService.personalForm.get('phoneNumber')?.setValue('+233 ', { emitEvent: false });
    }
  }

  public onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value.length === 1 && index < 5) {
      const inputs = this.otpInputs.toArray();
      inputs[index + 1].nativeElement.focus();
    }
  }

  public onOtpPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text');

    if (pasted && /^\d{6}$/.test(pasted)) {
      event.preventDefault();

      pasted.split('').forEach((digit, index) => {
        const controlName = `digit${index + 1}` as keyof typeof this.otpForm.value;
        this.otpForm.controls[controlName].setValue(digit);
      });

      this.otpInputs.last?.nativeElement.focus();
    }
  }

  public moveCursorToEnd(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;

    setTimeout(() => {
      const length = input.value.length;
      input.setSelectionRange(length, length);
    });
  }

  public onKeyDown(event: KeyboardEvent, index: number): void {
    const inputs = this.otpInputs.toArray();
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      if (input.value === '' && index > 0) {
        inputs[index - 1].nativeElement.focus();
        inputs[index - 1].nativeElement.value = '';
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
