import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SignupService } from '../../services/signup/signup.service';
import { RouterLink } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { LoginData } from '../../interfaces/login.interface';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, AsyncPipe, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  public readonly signupService = inject(SignupService);
  private readonly loginService = inject(LoginService);
  private readonly toastService = inject(ToastService);

  public loginForm = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
    ],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  public errorMessage(name: string): string {
    const control = this.loginForm.get(name);
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required'])
        return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
      if (control.errors?.['minlength'])
        return `${name.charAt(0).toUpperCase() + name.slice(1)} must be 6+ characters`;
      if (control.errors?.['pattern']) return 'Invalid email (e.g., user@domain.com)';
    }
    return '';
  }

  public onSubmit(): void {
    this.signupService.isSubmitting$.next(true);

    const loginData = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
    };

    this.loginService.login(loginData as LoginData).subscribe({
      next: (res) => {
        this.toastService.success('Login successful!');
        this.loginService.saveSession(res);
        this.signupService.isSubmitting$.next(false);
        this.loginForm.reset();
      },
      error: (err) => {
        this.toastService.error(err.error.message || 'Login failed. Please try again.');
        this.signupService.isSubmitting$.next(false);
      },
    });
  }
}
