import { Component, inject, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SignupService } from '../../services/signup/signup.service';
import { Observable, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { OtpSuccessResponse, SignupData } from '../../interfaces/signup.interface';
import { CountdownTimerService } from '../../services/countdown-timer/coutdown-timer.service';

@Component({
  selector: 'app-customer-signup',
  imports: [RouterLink, ReactiveFormsModule, AsyncPipe],
  templateUrl: './customer-signup.html',
  styleUrl: './customer-signup.css',
})
export class CustomerSignup implements OnDestroy {
  public signupService = inject(SignupService);
  private subscription = new Subscription();
  private userId = '';
  countdown$!: Observable<string>;
  canResend$!: Observable<boolean>;
  private readonly countdownTimerService = inject(CountdownTimerService);
  private TIMER_KEY = 'otp_expiry';

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

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
      next: (res) => {
        this.initTimer();
        this.signupService.isSubmitting$.next(false);
        alert('Email submitted successfully. Check your email for the otp code.');
        console.log('Success info: ', res);
        this.signupService.nextStep();
        this.otpInputs.first.nativeElement.focus();
      },
      error: (err) => {
        this.signupService.isSubmitting$.next(false);
        alert(`Failed to submit email: ${err.error.message || 'Unknown error occurred.'}`);
        console.log('Failure: ', err);
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
        alert('OTP verified successfully.');
        console.log('Success info: ', res);
        this.userId = res.userId;
        this.signupService.nextStep();
      },
      error: (err) => {
        this.signupService.isSubmitting$.next(false);
        alert(`Failed to submit email: ${err.error.message || 'Unknown error occurred.'}`);
        console.log('Failure: ', err);
      },
    });
  }

  private initTimer(): void {
    const { time$, finished$ } = this.countdownTimerService.start(this.TIMER_KEY, 600);
    this.countdown$ = time$;
    this.canResend$ = finished$;
  }

  public resendOtp(): void {
    this.signupService.resendOtp(this.emailForm.value.email || '').subscribe({
      next: (res) => {
        alert('OTP resent successfully. Check your email for the new otp code.');
        console.log('Success info: ', res);
        this.countdownTimerService.clear(this.TIMER_KEY);
        this.initTimer();
        this.signupService.otpForm.reset();
        this.otpInputs.first.nativeElement.focus();
      },
      error: (err) => {
        alert(`Failed to resend OTP: ${err.error.message || 'Unknown error occurred.'}`);
        console.log('Failure: ', err);
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
      next: (res) => {
        this.signupService.isSubmitting$.next(false);
        alert('Customer registered successfully.');
        console.log('Success info: ', res);
        this.signupService.resetAfterSuccess();
      },
      error: (err) => {
        this.signupService.isSubmitting$.next(false);
        alert(`Failed to register customer: ${err.error.message || 'Unknown error occurred.'}`);
        console.log('Failure: ', err);
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
      const inputs = this.otpInputs.toArray();
      for (let i = 0; i < 6; i++) {
        inputs[i].nativeElement.value = pasted[i];
      }
      inputs[5].nativeElement.focus();
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
