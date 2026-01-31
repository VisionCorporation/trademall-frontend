import {
  Component,
  inject,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SignupService } from '../../services/signup/signup.service';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { OtpSuccessResponse, SignupData } from '../../interfaces/signup.interface';
import { CountdownTimerService } from '../../services/countdown-timer/coutdown-timer.service';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-customer-signup',
  imports: [RouterLink, ReactiveFormsModule, AsyncPipe],
  templateUrl: './customer-signup.html',
  styleUrl: './customer-signup.css',
})
export class CustomerSignup implements OnInit, AfterViewInit, OnDestroy {
  public signupService = inject(SignupService);
  private toastService = inject(ToastService);
  private subscription = new Subscription();
  private userId = '';
  public countdown$!: Observable<string>;
  public canResend$!: Observable<boolean>;
  private readonly countdownTimerService = inject(CountdownTimerService);
  private TIMER_KEY = 'otp_expiry';
  private route = inject(Router);

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

    this.signupService.submitCustomerEmailForOtp(email).subscribe({
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

    this.signupService.verifyCustomerOtp(email, otp).subscribe({
      next: (res: OtpSuccessResponse) => {
        this.signupService.isSubmitting$.next(false);
        this.toastService.success('Email verified successfully.');
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

  public registerCustomer(): void {
    this.signupService.isSubmitting$.next(true);

    const formData = {
      userId: this.userId,
      firstName: this.personalForm.value.firstName,
      lastName: this.personalForm.value.lastName,
      phoneNumber: this.personalForm.value.phoneNumber,
      password: this.passwordForm.value.password,
      confirmPassword: this.passwordForm.value.confirmPassword,
    };

    this.signupService.registerCustomer(formData as SignupData).subscribe({
      next: () => {
        this.signupService.isSubmitting$.next(false);
        this.toastService.success('Account registered successfully. Log in now.');
        this.signupService.resetAfterSuccess();
        this.route.navigate(['/login']);
      },
      error: (err) => {
        this.signupService.isSubmitting$.next(false);
        this.toastService.error(`${err.error.message || 'Failed to register. Try again later.'}`);
      },
    });
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

  public emailErrorMessage(): string {
    return this.signupService.emailErrorMessage();
  }

  public phoneErrorMessage(): string {
    return this.signupService.phoneErrorMessage();
  }

  public passwordErrorMessage(): string {
    return this.signupService.passwordErrorMessage();
  }

  public confirmPasswordErrorMessage(): string {
    return this.signupService.confirmPasswordErrorMessage();
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
