import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SignupService } from '../../services/signup/signup.service';
import { Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-customer-signup',
  imports: [RouterLink, ReactiveFormsModule, AsyncPipe],
  templateUrl: './customer-signup.html',
  styleUrl: './customer-signup.css',
})
export class CustomerSignup implements OnInit, OnDestroy {
  public signupService = inject(SignupService);
  private subscription = new Subscription();

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  get currentStep() {
    return this.signupService.currentStep;
  }

  get emailForm() {
    return this.signupService.emailForm;
  }

  public submitEmailForOtp() {
    this.signupService.isSubmitting$.next(true);

    const email = this.emailForm.value.email || '';

    this.signupService.submitCustomerEmailForOtp(email).subscribe({
      next: (res) => {
        this.signupService.isSubmitting$.next(false);
        alert('Email submitted successfully. Check your email for the otp code.');
        console.log('Success info: ', res);
        this.signupService.currentStep++;
      },
      error: (err) => {
        this.signupService.isSubmitting$.next(false);
        alert(`Failed to submit email: ${err.error.message || 'Unknown error occurred.'}`);
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

  ngOnInit() {
    this.signupService.initialize();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  nextStep() {
    const result = this.signupService.nextStep();

    // if (result) {
    //   this.signupService.isSubmitting$.next(true);

    //   result.subscribe({
    //     next: (response) => {
    //       this.signupService.isSubmitting$.next(false);
    //       console.log('Signup successful:', response);
    //       this.signupService.resetAfterSuccess();
    //       alert('Signup successful! You can now log in.');
    //     },
    //     error: (error) => {
    //       this.signupService.isSubmitting$.next(false);
    //       console.error('Signup failed:', error);
    //       if (error.status === 500) {
    //         alert(`Signup failed: Email already registered.`);
    //       } else if (error.status === 0) {
    //         alert('Signup failed. Internet connection error.');
    //       } else {
    //         alert(`Signup failed: ${error.error.message || 'Unknown error occurred.'}`);
    //       }
    //     },
    //   });
    // }
  }
  goToStep(step: number) {
    this.signupService.goToStep(step);
  }

  emailErrorMessage() {
    return this.signupService.emailErrorMessage();
  }

  phoneErrorMessage() {
    return this.signupService.phoneErrorMessage();
  }

  passwordErrorMessage() {
    return this.signupService.passwordErrorMessage();
  }

  confirmPasswordErrorMessage() {
    return this.signupService.confirmPasswordErrorMessage();
  }

  formatPhoneNumber() {
    this.signupService.formatPhoneNumber();
  }

  onPhoneNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!value.startsWith('+233 ')) {
      input.value = '+233 ';
      this.signupService.personalForm.get('phoneNumber')?.setValue('+233 ', { emitEvent: false });
    }
  }

  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value.length === 1 && index < 5) {
      const inputs = this.otpInputs.toArray();
      inputs[index + 1].nativeElement.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
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

  logTheValues() {
    this.signupService.isVerifying$.next(true);

    setTimeout(() => {
      this.signupService.isVerifying$.next(false);
    }, 3000);

    const stage2Data = {
      email: this.emailForm.value.email,
      otp: Object.values(this.otpForm.value).join(''),
    };

    console.log(stage2Data);
  }
}
